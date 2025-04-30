//& detail page fr specific cryptocurrency
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

export default function CryptoDetail() {
  const { symbol } = useParams();
  return (
    <Container>
      <h1 className="my-4">Crypto Details: {symbol}</h1>
    </Container>
  );
}