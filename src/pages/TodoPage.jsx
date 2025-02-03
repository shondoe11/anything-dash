import { Container } from 'react-bootstrap';
import TodoWidget from '../widgets/Todo/TodoWidget';

export default function TodoPage() {
  return (
    <Container>
      <h1 className="my-4">Task Management</h1>
      <TodoWidget expandedView={true} />
    </Container>
  );
}