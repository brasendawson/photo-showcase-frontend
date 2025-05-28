export async function load({ cookies }) {
    const token = cookies.get('token');
    const username = cookies.get('username') || 'User';
    return {
      token,
      username
    };
  }