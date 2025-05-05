import React, { useState } from 'react';
import { Button, Form, Alert, Spinner, Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://localhost:7119/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirectUrl: `${window.location.protocol}//${window.location.host}/reset-password`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to send password reset link');
      }

      setSuccessMessage('Password reset link has been sent to your email.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send password reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="forgot-password-container">
      <Card className="forgot-password-card">
        <Card.Body>
          <h2 className="forgot-password-title">Forgot Password</h2>
          
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isLoading} 
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Sending...</span>
                  </>
                ) : 'Send Reset Link'}
              </Button>
            </div>
          </Form>
          
          <div className="text-center mt-3">
            <Button variant="link" onClick={() => navigate('/')}>
              Back to Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPasswordPage;