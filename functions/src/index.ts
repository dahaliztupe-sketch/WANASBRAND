import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const aggregateReservationStats = functions.firestore
  .document('reservations/{reservationId}')
  .onWrite(async (change, context) => {
    const statsRef = db.collection('stats').doc('latest');
    
    await db.runTransaction(async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      
      let totalSales = 0;
      let totalOrders = 0;
      let totalConfirmed = 0;
      
      if (statsDoc.exists) {
        const data = statsDoc.data();
        totalSales = data?.totalSales || 0;
        totalOrders = data?.totalOrders || 0;
        totalConfirmed = data?.totalConfirmed || 0;
      }

      // Handle Delete
      if (!change.after.exists) {
        const oldData = change.before.data();
        if (oldData) {
          totalOrders -= 1;
          if (['deposit_paid', 'in_production', 'shipped', 'delivered'].includes(oldData.status)) {
            totalConfirmed -= 1;
            totalSales -= (oldData.financials?.total || oldData.totalAmount || 0);
          }
        }
      } 
      // Handle Create
      else if (!change.before.exists) {
        const newData = change.after.data();
        if (newData) {
          totalOrders += 1;
          if (['deposit_paid', 'in_production', 'shipped', 'delivered'].includes(newData.status)) {
            totalConfirmed += 1;
            totalSales += (newData.financials?.total || newData.totalAmount || 0);
          }
        }
      } 
      // Handle Update
      else {
        const oldData = change.before.data();
        const newData = change.after.data();
        
        if (oldData && newData) {
          const oldIsConfirmed = ['deposit_paid', 'in_production', 'shipped', 'delivered'].includes(oldData.status);
          const newIsConfirmed = ['deposit_paid', 'in_production', 'shipped', 'delivered'].includes(newData.status);
          
          const oldTotal = oldData.financials?.total || oldData.totalAmount || 0;
          const newTotal = newData.financials?.total || newData.totalAmount || 0;

          if (!oldIsConfirmed && newIsConfirmed) {
            totalConfirmed += 1;
            totalSales += newTotal;
          } else if (oldIsConfirmed && !newIsConfirmed) {
            totalConfirmed -= 1;
            totalSales -= oldTotal;
          } else if (oldIsConfirmed && newIsConfirmed && oldTotal !== newTotal) {
            totalSales += (newTotal - oldTotal);
          }
        }
      }

      transaction.set(statsRef, {
        totalSales,
        totalOrders,
        totalConfirmed,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
  });
