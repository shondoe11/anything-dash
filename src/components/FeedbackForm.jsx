import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Form as RBForm, Button, Row, Col } from 'react-bootstrap';
import * as Yup from 'yup';
import { submitFeedback } from '../services/feedbackService';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function FeedbackForm() {
  const { userRecordId } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    name: '',
    email: '',
    dateOfBirth: '',
    rating: 0,
    improvementAreas: '',
    bugReport: '',
    additionalFeedback: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('required'),
    email: Yup.string().email('invalid email').required('required'),
    dateOfBirth: Yup.date().optional(),
    rating: Yup.number().min(0.5, 'Please rate at least half a star').max(5).required('required'),
    improvementAreas: Yup.string().max(1000).required('required'),
    bugReport: Yup.string().max(500),
    additionalFeedback: Yup.string().max(1000),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const data = { ...values, userId: userRecordId };
      const result = await submitFeedback(data);
      if (result.success) {
        toast.success('Thank you for your feedback!');
        resetForm();
        navigate('/');
      } else {
        toast.error(result.error || 'Failed to submit feedback');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting, values, setFieldValue }) => (
        <Form as={RBForm}>
          <Row>
            <Col md={6} className="mb-3">
              <RBForm.Group controlId="name">
                <RBForm.Label>Name</RBForm.Label>
                <Field name="name" as={RBForm.Control} />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </RBForm.Group>
            </Col>
            <Col md={6} className="mb-3">
              <RBForm.Group controlId="email">
                <RBForm.Label>Email</RBForm.Label>
                <Field name="email" type="email" as={RBForm.Control} />
                <ErrorMessage name="email" component="div" className="text-danger" />
              </RBForm.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <RBForm.Group controlId="dateOfBirth">
                <RBForm.Label>Date of Birth</RBForm.Label>
                <Field name="dateOfBirth" type="date" as={RBForm.Control} />
                <ErrorMessage name="dateOfBirth" component="div" className="text-danger" />
              </RBForm.Group>
            </Col>
            <Col md={6} className="mb-3">
              <RBForm.Group>
                <RBForm.Label>Rating</RBForm.Label>
                <StarRating value={values.rating} onChange={val => setFieldValue('rating', val)} />
                <ErrorMessage name="rating" component="div" className="text-danger" />
              </RBForm.Group>
            </Col>
          </Row>
          <RBForm.Group controlId="improvementAreas" className="mb-3">
            <RBForm.Label>What could be improved?</RBForm.Label>
            <Field name="improvementAreas" as="textarea" className="form-control" rows={3} />
            <ErrorMessage name="improvementAreas" component="div" className="text-danger" />
          </RBForm.Group>
          <RBForm.Group controlId="bugReport" className="mb-3">
            <RBForm.Label>Bug Report</RBForm.Label>
            <Field name="bugReport" as="textarea" className="form-control" rows={3} />
            <ErrorMessage name="bugReport" component="div" className="text-danger" />
          </RBForm.Group>
          <RBForm.Group controlId="additionalFeedback" className="mb-3">
            <RBForm.Label>Additional Feedback</RBForm.Label>
            <Field name="additionalFeedback" as="textarea" className="form-control" rows={3} />
            <ErrorMessage name="additionalFeedback" component="div" className="text-danger" />
          </RBForm.Group>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
}
