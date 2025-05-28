import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData();
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    // Server-side password validation
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return {
        type: 'failure',
        data: { 
          error: 'Password must contain: 8+ characters, uppercase, lowercase, number, and special character'
        }
      };
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          return {
            type: 'failure',
            data: { error: errorData.errors.map(err => err.message).join(', ') }
          };
        }
        return {
          type: 'failure',
          data: { error: errorData.message || 'Registration failed' }
        };
      }

      throw redirect(303, '/login?registered=true');
    } catch (error) {
      if (error.status === 303) throw error;
      console.error('Registration error:', error);
      return {
        type: 'failure',
        data: { error: 'Registration failed. Please try again.' }
      };
    }
  }
};