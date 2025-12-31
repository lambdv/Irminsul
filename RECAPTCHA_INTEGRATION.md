# Google reCAPTCHA Integration

This application now includes Google reCAPTCHA integration to protect against automated bots and spam attacks.

## Configuration

### 1. Get Google reCAPTCHA Keys

1. Go to the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Sign in with your Google account
3. Fill out the form:
   - **Label**: Your project name (e.g., "Irminsul")
   - **reCAPTCHA type**: Choose "reCAPTCHA v3" (recommended for better UX) or "reCAPTCHA v2"
   - **Domains**: Add your domain (e.g., "localhost", "yourdomain.com")
4. Accept the terms of service and click "Submit"
5. Copy the **Site Key** and **Secret Key**

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Google reCAPTCHA v2
RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### 3. Deployment Considerations

- **Development**: Use test keys (Google provides test keys for localhost)
- **Production**: Use production keys from your registered domain
- **Multiple Domains**: Register each domain in the reCAPTCHA admin console

## Implementation Details

### Components Used

1. **`/src/lib/recaptcha.ts`**: Utility functions for verification
2. **`/src/components/ui/Recaptcha.tsx`**: React components for v2 and v3
3. **`/src/app/(auth)/login/page.tsx`**: Login form with reCAPTCHA integration
4. **`/src/app/(auth)/login/handlelogin.ts`**: Server action with reCAPTCHA validation
5. **`/middleware.ts`**: Middleware for additional protection

### reCAPTCHA Versions

#### reCAPTCHA v3 (Invisible)

- Automatically runs in the background
- Returns a risk score (0.0-1.0)
- Better user experience
- Default for this application

#### reCAPTCHA v2 (Visible)

- Shows the "I'm not a robot" checkbox
- Used as fallback if v3 fails
- Users must manually complete the challenge

### Security Features

1. **Token Verification**: Server-side validation of reCAPTCHA tokens
2. **IP Tracking**: Includes client IP in verification requests
3. **Score Thresholding**: Configurable minimum score for v3
4. **Rate Limiting**: Integration with existing rate limiting system
5. **Middleware Protection**: Additional layer for API endpoints

## Usage Examples

### Basic Usage with reCAPTCHA v3

```typescript
import { useRecaptchaV3 } from '@/components/ui/Recaptcha'

function MyForm() {
  const { executeRecaptcha } = useRecaptchaV3()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = await executeRecaptcha('form_submit')
    if (token) {
      // Submit form with token
      await submitForm(token)
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Manual reCAPTCHA v2

```typescript
import Recaptcha from '@/components/ui/Recaptcha'

function MyForm() {
  const [token, setToken] = useState(null)

  const handleVerify = (recaptchaToken) => {
    setToken(recaptchaToken)
  }

  return (
    <form>
      <Recaptcha onVerify={handleVerify} />
      <button type="submit" disabled={!token}>
        Submit
      </button>
    </form>
  )
}
```

### Server-Side Verification

```typescript
import { verifyRecaptcha } from "@/lib/recaptcha"

export async function myAction(token: string) {
  const result = await verifyRecaptcha(token)

  if (!result.success) {
    throw new Error("reCAPTCHA verification failed")
  }

  // Process the action
}
```

## Testing

### Development Environment

- Use Google's test keys for localhost testing
- reCAPTCHA v3 always returns a score of 0.9 in test mode

### Test Keys

```env
RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEbUjQWpH1V2hO
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

### Testing Steps

1. Add test keys to your `.env.local`
2. Start the development server
3. Navigate to `/login`
4. Try logging in with and without completing reCAPTCHA
5. Check browser console for verification logs

## Troubleshooting

### Common Issues

1. **"reCAPTCHA not configured" error**
   - Check environment variables are set correctly
   - Ensure `.env` file is loaded

2. **"reCAPTCHA verification failed"**
   - Verify domain registration in Google Console
   - Check site key and secret key match

3. **reCAPTCHA widget not appearing**
   - Check browser console for JavaScript errors
   - Verify network connectivity to Google's servers

4. **Performance issues**
   - Consider using reCAPTCHA v3 for better UX
   - Implement lazy loading for reCAPTCHA scripts

### Monitoring

Monitor reCAPTCHA performance:

- Check server logs for verification results
- Monitor token success/failure rates
- Track user completion rates for v2 challenges

## Security Best Practices

1. **Always verify tokens server-side** - Never trust client-side validation
2. **Use appropriate score thresholds** - Adjust based on your risk tolerance
3. **Monitor verification logs** - Look for patterns of abuse
4. **Implement fallback mechanisms** - Handle service outages gracefully
5. **Regularly rotate keys** - Update keys periodically for security

## Integration with Existing Features

The reCAPTCHA integration works seamlessly with:

- NextAuth.js authentication
- Discord OAuth2 provider
- Existing rate limiting system
- Stripe payment processing
- API route protection

For more information, see the [Google reCAPTCHA documentation](https://developers.google.com/recaptcha).
