import { Container } from 'react-bootstrap';
import CryptoWidget from '../widgets/Crypto/CryptoWidget';

export default function CryptoPage() {
  return (
    <Container>
      <h1 className="my-4">Cryptocurrency Data</h1>
      <CryptoWidget expandedView={true} />
    </Container>
  );
}