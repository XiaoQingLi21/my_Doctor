// SignIn.tsx
import React, { useState } from 'react';
import { supabase } from '@utils/supabaseClient';
import { style } from 'typestyle';

// Define your User interface
interface User {
    id: string; // UUID from Supabase auth
    aud: string; // Audience from Supabase auth
    role?: string; // Role from Supabase auth, optional as it might not always be present
    email?: string; // User's email, optional as it might not always be present
    email_confirmed_at?: string; // Optional, might not always be present
    created_at?: string; // User creation time, optional
    last_sign_in_at?: string; // Last sign-in time, optional
    full_name?: string; // Optional, from your custom table
    avatar_url?: string; // Optional, from your custom table
    billing_address?: object; // JSONB, optional
    payment_method?: object; // JSONB, optional
    token_number?: number; // Optional, from your custom table
    consumed_token?: number; // Optional, from your custom table
    app_metadata?: { provider?: string; providers?: string[] }; // Metadata, optional
  }

// Updated styles using TypeStyle
const welcomeMessageClass = style({
    fontSize: '16px', // Adjust font size for readability
    lineHeight: '1.8', // Increase line height for better text flow
    color: '#555', // Maintain a comfortable reading color
    marginTop: '10px', // Adjust top margin
    marginBottom: '20px', // Adjust bottom margin
    maxWidth: '600px', // Maintain a readable text width
    textAlign: 'justify', // Justify the text for a clean look
    textIndent: '2em', // Indent the first line for a classic look
    padding: '0 10px', // Add some padding for space around the text
  });
const containerClass = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '20px',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
});

const headerClass = style({
  fontSize: '32px', // Larger font size for the header
  fontWeight: 'bold', // Make the header bold
  textAlign: 'center',
  color: '#333',
  marginBottom: '10px',
});

const formClass = style({
  display: 'flex',
  flexDirection: 'column',
  width: '300px',
  alignItems: 'center',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
  padding: '20px',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
  marginTop: '20px', // Add space between text and form
});

const inputClass = style({
  margin: '10px 0',
  padding: '10px',
  width: '100%',
  borderRadius: '5px',
  border: '1px solid #ddd',
});

const buttonClass = style({
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px',
  width: '100%',
  fontSize: '16px',
});
const signUpButtonClass = style({
    marginTop: '10px',
    textDecoration: 'underline',
    cursor: 'pointer',
    color: '#4CAF50',
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '16px',
  });
const errorClass = style({
  color: 'red',
  margin: '10px 0',
});

// SignIn component
interface SignInProps {
  onUserSignedIn: (user: User) => void;
}

function SignIn({ onUserSignedIn }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // const [email, setEmail] = useState('platformaiyang@gmail.com');
  // const [password, setPassword] = useState('integrityyang123');

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        onUserSignedIn(data.user as User);
        localStorage.setItem('userid', data.user.id);

      }
    } catch (error) {
      const err = error as Error;
      console.error('Sign-in error:', err);
      setErrorMessage(err.message);
    }
  };
  const handleSignUp = () => {
    window.location.href = 'https://testgpt2.platformai.org/homepage';
  };
  return (
    <div className={containerClass}>
      <h1 className={headerClass}>Virtual Companions</h1>
      <p className={welcomeMessageClass}>
        Discover a companion for every need: be it a virtual friend, partner, or a comforting presence of a passed away relative. Customize or choose from presets to find your perfect match.
        <br /><br />
        Personalize Your Companions: Shape your unique virtual companions by specifying their gender, age, avatar, voice, and personality traits. Create an experience that's truly your own.<br />
        Girl Friend: A caring and supportive partner for meaningful conversations.<br />
        Boy Friend: Someone to share your interests with and offer companionship.<br />
        Passed Away Relatives: A sensitive replication to reminisce and share memories.<br />
        
        <br />
        Our Virtual Companions platform is designed to cater to a wide array of needs, allowing you to personalize a digital partner, friend, or even recreate the essence of passed-away loved ones. This unique blend of technology and personalization ensures that you can always find the perfect companion to enrich your daily life with meaningful interaction and support.
        </p>
      {errorMessage && <p className={errorClass}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} className={formClass}>
        <input 
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <input 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass}
        />
        <button type="submit" className={buttonClass}>Login</button>
        <button onClick={handleSignUp} className={signUpButtonClass}>Register</button>
      </form>
    </div>
  );
}

export default SignIn;
