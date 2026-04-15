import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ReservationConfirmationEmailProps {
  customerName: string;
  reservationId: string;
  magicLink: string;
}

export const ReservationConfirmationEmail = ({
  customerName,
  reservationId,
  magicLink,
}: ReservationConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your WANAS Reservation #{reservationId} is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>WANAS</Heading>
          <Text style={subtitle}>Atelier de Haute Couture</Text>
        </Section>
        
        <Section style={content}>
          <Heading style={title}>Confirmation of Reservation</Heading>
          <Text style={text}>
            Dear {customerName},
          </Text>
          <Text style={text}>
            It is our distinct pleasure to confirm that your reservation <strong>#{reservationId}</strong> has been received at the WANAS Atelier. 
            Our master artisans are now preparing to bring your selection to life with the meticulous care it deserves.
          </Text>
        </Section>

        <Section style={actionContainer}>
          <Text style={actionText}>Access your private tracking portal via the link below:</Text>
          <Link href={magicLink} style={button}>
            Enter Private Portal
          </Link>
        </Section>

        <Section style={footer}>
          <Hr style={hr} />
          <Text style={footerText}>
            Should you require any assistance, our Client Services team is available to guide you through your journey with WANAS.
          </Text>
          <Text style={signature}>
            With elegance,<br />
            <strong>The WANAS Team</strong>
          </Text>
        </Section>
        
        <Text style={copyright}>
          &copy; 2026 WANAS Fashion House | Cairo, Egypt
        </Text>
      </Container>
    </Body>
  </Html>
);

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

const subtitle = {
  fontSize: '10px',
  letterSpacing: '4px',
  textTransform: 'uppercase' as const,
  color: '#888',
  marginTop: '10px',
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

const actionContainer = {
  backgroundColor: '#f9f9f9',
  padding: '40px',
  borderRadius: '2px',
  textAlign: 'center' as const,
};

const actionText = {
  fontSize: '14px',
  color: '#666',
  marginBottom: '25px',
  letterSpacing: '1px',
};

const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: '18px 45px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  display: 'inline-block',
};

const footer = {
  paddingTop: '40px',
};

const hr = {
  borderColor: '#eeeeee',
  margin: '0 0 30px 0',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '1.8',
  color: '#666',
  fontWeight: '300',
};

const signature = {
  fontSize: '14px',
  marginTop: '30px',
};

const copyright = {
  textAlign: 'center' as const,
  paddingTop: '80px',
  fontSize: '10px',
  color: '#aaa',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
};
