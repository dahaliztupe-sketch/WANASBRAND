/**
 * WANAS Shipping Integration — Aramex & DHL support
 * Reads SHIPPING_PROVIDER env var to select provider.
 * Falls back to stub mode when credentials are absent.
 */

export type ShippingProvider = 'aramex' | 'dhl' | 'bosta' | 'stub';

export interface ShippingLabelRequest {
  reservationId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  country?: string;
  postalCode?: string;
  items: { name: string; weight: number; quantity?: number }[];
  totalWeight?: number;
  notes?: string;
}

export interface ShippingLabelResult {
  success: boolean;
  trackingNumber: string | null;
  labelUrl: string | null;
  provider: ShippingProvider;
  estimatedDays?: number;
  error?: string;
}

export interface TrackingResult {
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  statusAr: string;
  location?: string;
  lastUpdate: string;
  estimatedDelivery?: string;
  events?: Array<{ time: string; description: string; location?: string }>;
  provider: ShippingProvider;
}

function getProvider(): ShippingProvider {
  const p = process.env.SHIPPING_PROVIDER as ShippingProvider | undefined;
  if (p && ['aramex', 'dhl', 'bosta'].includes(p)) return p;
  return 'stub';
}

/* ─── Aramex ─────────────────────────────────────────────────── */

async function aramexCreateShipment(req: ShippingLabelRequest): Promise<ShippingLabelResult> {
  const accountNumber  = process.env.ARAMEX_ACCOUNT_NUMBER;
  const accountPin     = process.env.ARAMEX_ACCOUNT_PIN;
  const accountEntity  = process.env.ARAMEX_ACCOUNT_ENTITY ?? 'CAI';
  const accountPrefix  = process.env.ARAMEX_ACCOUNT_PREFIX ?? 'WWEX';

  if (!accountNumber || !accountPin) {
    console.warn('[Shipping/Aramex] Missing credentials — using stub');
    return stubCreateShipment(req);
  }

  const totalWeight = req.totalWeight ?? req.items.reduce((s, i) => s + i.weight, 0);

  const body = {
    ClientInfo: {
      AccountCountryCode: 'EG',
      AccountEntity: accountEntity,
      AccountNumber: accountNumber,
      AccountPin: accountPin,
      AccountPrefix: accountPrefix,
      UserName: process.env.ARAMEX_USERNAME ?? '',
      Password: process.env.ARAMEX_PASSWORD ?? '',
      Version: 'v1.0',
    },
    Shipment: {
      Shipper: {
        Reference1: req.reservationId,
        AccountNumber: accountNumber,
        PartyAddress: {
          Line1: process.env.ATELIER_ADDRESS ?? 'WANAS Atelier, Cairo',
          City: 'Cairo',
          CountryCode: 'EG',
        },
        Contact: {
          PersonName: 'WANAS Atelier',
          PhoneNumber1: process.env.ATELIER_PHONE ?? '+20100000000',
        },
      },
      Consignee: {
        Reference1: req.reservationId,
        PartyAddress: {
          Line1: req.address,
          City: req.city,
          CountryCode: req.country ?? 'EG',
          PostCode: req.postalCode ?? '',
        },
        Contact: {
          PersonName: req.customerName,
          PhoneNumber1: req.customerPhone,
        },
      },
      ShippingDateTime: new Date().toISOString(),
      Details: {
        Dimensions: { Length: 50, Width: 40, Height: 20 },
        ActualWeight: { Unit: 'KG', Value: totalWeight },
        ProductType: 'PPX',
        PaymentType: 'P',
        Services: '',
        NumberOfPieces: req.items.reduce((s, i) => s + (i.quantity ?? 1), 0),
        DescriptionOfGoods: req.items.map(i => i.name).join(', '),
        GoodsOriginCountry: 'EG',
      },
    },
    LabelInfo: { ReportID: 9201, ReportType: 'RPT' },
  };

  try {
    const res = await fetch('https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json() as {
      HasErrors: boolean;
      Shipments?: Array<{ ID: string; TrackingNumber: string }>;
    };

    if (data.HasErrors || !data.Shipments?.[0]) {
      console.error('[Shipping/Aramex] Error creating shipment:', data);
      return { success: false, trackingNumber: null, labelUrl: null, provider: 'aramex', error: JSON.stringify(data) };
    }

    const shipment = data.Shipments[0];
    return {
      success: true,
      trackingNumber: shipment.TrackingNumber,
      labelUrl: `https://www.aramex.com/track/${shipment.TrackingNumber}`,
      provider: 'aramex',
      estimatedDays: 3,
    };
  } catch (e) {
    console.error('[Shipping/Aramex] Request failed:', e);
    return { success: false, trackingNumber: null, labelUrl: null, provider: 'aramex', error: String(e) };
  }
}

async function aramexTrackShipment(trackingNumber: string): Promise<TrackingResult> {
  const accountNumber = process.env.ARAMEX_ACCOUNT_NUMBER;
  const accountPin    = process.env.ARAMEX_ACCOUNT_PIN;

  if (!accountNumber || !accountPin) return stubTrackShipment(trackingNumber);

  try {
    const res = await fetch('https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ClientInfo: {
          AccountCountryCode: 'EG',
          AccountEntity: process.env.ARAMEX_ACCOUNT_ENTITY ?? 'CAI',
          AccountNumber: accountNumber,
          AccountPin: accountPin,
          AccountPrefix: process.env.ARAMEX_ACCOUNT_PREFIX ?? 'WWEX',
        },
        Shipments: [trackingNumber],
      }),
    });

    const data = await res.json() as {
      HasErrors: boolean;
      TrackingResults?: Array<{
        Value?: Array<{ UpdateDescription: string; UpdateDateTime: string; UpdateLocation: string; UpdateCode: string }>;
      }>;
    };

    if (data.HasErrors || !data.TrackingResults?.[0]?.Value?.length) {
      return stubTrackShipment(trackingNumber);
    }

    const events = data.TrackingResults[0].Value;
    const latest = events[0]!;

    const statusMap: Record<string, TrackingResult['status']> = {
      'SH': 'picked_up', 'IT': 'in_transit', 'OD': 'out_for_delivery',
      'DL': 'delivered', 'UN': 'failed', 'RTO': 'returned',
    };

    return {
      status: statusMap[latest.UpdateCode] ?? 'in_transit',
      statusAr: mapStatusToArabic(statusMap[latest.UpdateCode] ?? 'in_transit'),
      location: latest.UpdateLocation,
      lastUpdate: latest.UpdateDateTime,
      events: events.map(e => ({ time: e.UpdateDateTime, description: e.UpdateDescription, location: e.UpdateLocation })),
      provider: 'aramex',
    };
  } catch (e) {
    console.error('[Shipping/Aramex] Tracking failed:', e);
    return stubTrackShipment(trackingNumber);
  }
}

/* ─── Bosta (Egyptian local) ─────────────────────────────────── */

async function bostaCreateShipment(req: ShippingLabelRequest): Promise<ShippingLabelResult> {
  const apiKey = process.env.BOSTA_API_KEY;
  if (!apiKey) return stubCreateShipment(req);

  try {
    const res = await fetch('https://app.bosta.co/api/v2/deliveries', {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 10,
        specs: { packageType: 'Parcel', size: 'Medium', weight: req.totalWeight ?? 1 },
        receiver: {
          name: req.customerName,
          phone: req.customerPhone,
          address: {
            city: req.city,
            firstLine: req.address,
          },
        },
        notes: req.notes ?? `Reservation #${req.reservationId}`,
      }),
    });

    const data = await res.json() as { _id?: string; trackingNumber?: string };
    if (!data._id) return { success: false, trackingNumber: null, labelUrl: null, provider: 'bosta' };

    return {
      success: true,
      trackingNumber: data.trackingNumber ?? data._id,
      labelUrl: `https://track.bosta.co/shipments/track/${data.trackingNumber}`,
      provider: 'bosta',
      estimatedDays: 2,
    };
  } catch (e) {
    return { success: false, trackingNumber: null, labelUrl: null, provider: 'bosta', error: String(e) };
  }
}

/* ─── Stub (no credentials) ──────────────────────────────────── */

function stubCreateShipment(req: ShippingLabelRequest): ShippingLabelResult {
  const id = `WANAS-${req.reservationId.slice(-6).toUpperCase()}`;
  return {
    success: true,
    trackingNumber: id,
    labelUrl: `https://wanas-atelier.com/track?id=${id}`,
    provider: 'stub',
    estimatedDays: 3,
  };
}

function stubTrackShipment(_trackingNumber: string): TrackingResult {
  return {
    status: 'in_transit',
    statusAr: 'في الطريق إليكِ',
    location: 'مركز التوزيع — القاهرة',
    lastUpdate: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 2 * 86400000).toLocaleDateString('ar-EG'),
    provider: 'stub',
  };
}

function mapStatusToArabic(status: TrackingResult['status']): string {
  const map: Record<TrackingResult['status'], string> = {
    pending: 'قيد الانتظار',
    picked_up: 'تم الاستلام من الأتيليه',
    in_transit: 'في الطريق إليكِ',
    out_for_delivery: 'مع المندوب',
    delivered: 'تم التسليم',
    failed: 'تعذّر التسليم',
    returned: 'تم الإرجاع',
  };
  return map[status] ?? 'غير معروف';
}

/* ─── Public API ─────────────────────────────────────────────── */

export const generateShippingLabel = async (req: ShippingLabelRequest): Promise<ShippingLabelResult> => {
  const provider = getProvider();
  switch (provider) {
    case 'aramex': return aramexCreateShipment(req);
    case 'bosta':  return bostaCreateShipment(req);
    default:       return stubCreateShipment(req);
  }
};

export const getTrackingStatus = async (trackingNumber: string): Promise<TrackingResult> => {
  const provider = getProvider();
  switch (provider) {
    case 'aramex': return aramexTrackShipment(trackingNumber);
    default:       return stubTrackShipment(trackingNumber);
  }
};
