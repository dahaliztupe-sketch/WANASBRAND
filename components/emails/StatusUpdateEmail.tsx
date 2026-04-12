import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface StatusUpdateEmailProps {
  customerName: string;
  orderId: string;
  status: 'deposit_paid' | 'shipped';
  trackingInfo?: string;
}

export const StatusUpdateEmail = ({
  customerName,
  orderId,
  status,
  trackingInfo,
}: StatusUpdateEmailProps) => {
  const message = status === 'deposit_paid' 
    ? 'Your deposit is received, weaving has begun.'
    : `Your sanctuary piece is on its way.${trackingInfo ? ` Tracking: ${trackingInfo}` : ''}`;

  return (
    <Html>
      <Head />
      <Preview>WANAS Reservation Update: #{orderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>WANAS</Heading>
          </Section>
          
          <Section style={content}>
            <Heading style={title}>Reservation Update</Heading>
            <Text style={text}>
              Dear {customerName},
            </Text>
            <Text style={text}>
              {message}
            </Text>
          </Section>

          <Section style={footer}>
            <Hr style={hr} />
            <Text style={signature}>
              With elegance,<br />
              <strong>The WANAS Team</strong>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Inter", sans-serif',
  color: '#1a1a1a',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  paddingBottom: '60px',
};

const logo = {
  fontFamily: '"Playfair Display", serif',
  fontSize: '36px',
  fontWeight: '400',
  letterSpacing: '8px',
  margin: '0',
  textTransform: 'uppercase' as const,
};

const content = {
  paddingBottom: '30px',
};

const title = {
  fontFamily: '"Playfair Display", serif',
  fontSize: '24px',
  fontWeight: '400',
  marginBottom: '20px',
};

const text = {
  fontSize: '16px',
  lineHeight: '1.8',
  fontWeight: '300',
};

const footer = {
  paddingTop: '40px',
};

const hr = {
  borderColor: '#eeeeee',
  margin: '0 0 30px 0',
};

const signature = {
  fontSize: '14px',
  marginTop: '30px',
};
