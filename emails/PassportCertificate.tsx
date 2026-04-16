import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a serif font if needed, otherwise use default
Font.register({
  family: 'Times-Roman',
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#FDFBF7',
    fontFamily: 'Times-Roman',
  },
  container: {
    border: '1px solid #D4AF37',
    padding: 40,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    letterSpacing: 5,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 8,
    textAlign: 'center',
    letterSpacing: 10,
    textTransform: 'uppercase',
    marginBottom: 40,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: '#D4AF37',
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#CCC',
    marginVertical: 20,
  },
});

interface PassportData {
  productName: string;
  certificateNumber: string;
  customerName: string;
  purchaseDate: string;
  materials: string;
  craftsmanship: string;
  careInstructions: string;
}

export const PassportCertificate = ({ passport }: { passport: PassportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>WANAS</Text>
        <Text style={styles.subtitle}>Digital Product Passport</Text>
        
        <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 10 }}>{passport.productName}</Text>
        <Text style={{ fontSize: 10, textAlign: 'center', color: '#666' }}>CERT NO. {passport.certificateNumber}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Provenance</Text>
        <Text style={styles.text}>Issued exclusively to {passport.customerName} on {passport.purchaseDate}.</Text>
        
        <Text style={styles.sectionTitle}>Materials</Text>
        <Text style={styles.text}>{passport.materials}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Craftsmanship & Care</Text>
        <Text style={styles.text}>{passport.craftsmanship}</Text>
        <Text style={{ fontSize: 10, color: '#666', fontStyle: 'italic' }}>{passport.careInstructions}</Text>
      </View>
    </Page>
  </Document>
);
