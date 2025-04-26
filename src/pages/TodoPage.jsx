//& todo pg: list & manage tasks
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, ButtonGroup } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useTodos from '../hooks/useTodos';
import { FaCalendarAlt } from 'react-icons/fa';

export default function TodoPage() {
  const { tasks, loading, error, deleteTask, archiveTasks, editTask } = useTodos();
  const navigate = useNavigate();
  const { id: editParam } = useParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDue, setEditDue] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filter, setFilter] = useState('All');

  //& open edit modal on route
  useEffect(() => {
    if (editParam) {
      const t = tasks.find(t=>t.id===editParam);
      if (t) {
        setEditId(editParam);
        setEditDesc(t.Tasks);
        setEditDue(t['Due Date']||'');
        setShowEditModal(true);
      }
    }
  }, [editParam, tasks]);

  const handleCloseEdit = () => { setShowEditModal(false); navigate('/todo'); };
  const handleSaveEdit = () => { editTask(editId,{Tasks:editDesc,'Due Date':editDue||null}); handleCloseEdit(); };
  const completedIds = tasks.filter(t=>t.Status==='Completed').map(t=>t.id);
  const handleShowDelete = () => setShowDeleteModal(true);
  const handleCloseDelete = () => setShowDeleteModal(false);
  const handleConfirmDeleteAll = () => { archiveTasks(completedIds); handleCloseDelete(); };

  const sortedTasks = [...tasks].sort((a,b) => new Date(b['Created At']||b.createdTime) - new Date(a['Created At']||a.createdTime));
  const filteredTasks = sortedTasks.filter(task => {
    const isOverdue = task.Status !== 'Completed' && task['Due Date'] && new Date(task['Due Date']) < new Date();
    if (filter === 'Completed') return task.Status === 'Completed';
    if (filter === 'Overdue') return isOverdue;
    if (filter === 'Active') return task.Status !== 'Completed' && !isOverdue;
    return true;
  });

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return <Container><p className="text-danger">Failed to load tasks.</p></Container>;
  }

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Task Management</h1>
        <Link to="/todo/new">
          <Button variant="primary">+ New Task</Button>
        </Link>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <ButtonGroup>
          {['All', 'Completed', 'Overdue', 'Active'].map(f => (
            <Button key={f} variant={filter===f?'primary':'outline-primary'} onClick={()=>setFilter(f)}>
              {f}
            </Button>
          ))}
        </ButtonGroup>
        <Button variant="danger" onClick={handleShowDelete}>
          Delete All Completed
        </Button>
      </div>
      {filteredTasks.length === 0 ? (
        <div className="text-center my-5">
          {filter === 'All' && 'No tasks available for this user. Click +New Task to create your first task.'}
          {filter === 'Completed' && 'No completed tasks available for this user.'}
          {filter === 'Overdue' && 'No overdue tasks available for this user.'}
          {filter === 'Active' && 'No active tasks available for this user.'}
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {filteredTasks.map(task => {
            const isOverdue = task.Status !== 'Completed' && task['Due Date'] && new Date(task['Due Date']) < new Date();
            const borderClass = task.Status === 'Completed'
              ? 'border-start border-4 border-success'
              : isOverdue
                ? 'border-start border-4 border-danger'
                : '';
            return (
              <Col key={task.id}>
                <Card className={`h-100 shadow-sm widget-card transition-card ${borderClass}`}>  
                  <Card.Body>
                    <Card.Title>{task.Tasks}</Card.Title>
                    <div className="text-muted small d-flex align-items-center mb-2">
                      <FaCalendarAlt className="me-1" /> Due: {task['Due Date'] || '—'}
                    </div>
                    <div className="d-flex justify-content-end">
                      {task.Status==='Completed'?(
                        <Button size="sm" variant="outline-warning" className="me-2 incomplete-btn" onClick={()=>editTask(task.id,{Status:'New'})}>Incomplete</Button>
                      ):(
                        <Button size="sm" variant="outline-success" className="me-2" onClick={()=>editTask(task.id,{Status:'Completed'})}>Complete</Button>
                      )}
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={()=>navigate(`/todo/edit/${task.id}`)}>Edit</Button>
                      <Button size="sm" variant="outline-danger" className="me-2 delete-btn" onClick={()=>deleteTask(task.id)}>Delete</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
      <Modal show={showEditModal} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Control
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Task Description"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              type="date"
              value={editDue}
              onChange={e => setEditDue(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveEdit}>Save</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDeleteModal} onHide={handleCloseDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to permanently delete all completed tasks? This cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDelete}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDeleteAll}>Delete All</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}