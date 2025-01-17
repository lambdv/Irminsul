export default function LoginPage() {
  async function handleSubmit(formData: FormData) {
    'use server';
    
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    
    // TODO: Implement your login logic here
    console.log('Login attempt:', { username, email, password });
  }

  return (
    <div>
      <h1>Login</h1>
      <form action={handleSubmit} className="flex flex-col gap-2">
        <input type="text" name="username" placeholder="Username" />
        {/* <input type="text" name="email" placeholder="Email" /> */}
        <input type="password" name="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
