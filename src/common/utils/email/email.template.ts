export const emailTemplate = (otp : number, userName : string) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Social Media Account</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .email-wrapper {
            max-width: 500px;
            width: 100%;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .greeting {
            font-size: 18px;
            color: #333333;
            margin: 0 0 15px 0;
            font-weight: 600;
        }
        .message {
            font-size: 15px;
            line-height: 1.6;
            color: #666666;
            margin: 0 0 30px 0;
        }
        .otp-box {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            font-size: 13px;
            color: #999999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            display: block;
        }
        .otp-code {
            font-family: 'Courier New', monospace;
            font-size: 48px;
            font-weight: 700;
            color: #667eea;
            letter-spacing: 8px;
            margin: 0;
            text-align: center;
        }
        .timer {
            font-size: 13px;
            color: #999999;
            text-align: center;
            margin-top: 10px;
        }
        .security-notice {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
            line-height: 1.5;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #eeeeee;
        }
        .footer-text {
            font-size: 12px;
            color: #999999;
            margin: 0;
        }
        .footer-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        .footer-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
            <!-- Header -->
            <tr>
                <td class="header" align="center">
                    <h1>✨ Social Connect</h1>
                </td>
            </tr>

            <!-- Main Content -->
            <tr>
                <td class="content" align="center">
                    <p class="greeting">Welcome, ${userName}! 👋</p>
                    
                    <p class="message">
                        We're excited to have you join our community! To complete your account setup and secure your profile, please verify your email address using the code below.
                    </p>

                    <!-- OTP Box -->
                    <div class="otp-box">
                        <span class="otp-label">Your Verification Code</span>
                        <p class="otp-code">${otp}</p>
                        <p class="timer">⏱️ Valid for 10 minutes</p>
                    </div>

                    <!-- Security Notice -->
                    <div class="security-notice">
                        🔒 <strong>Never share this code.</strong> We will never ask you for this code via email, phone, or support chat.
                    </div>

                    <p class="message" style="margin-bottom: 10px;">
                        Didn't request this code? No worries! You can safely ignore this email if you didn't try to create an account.
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="footer" align="center">
                    <p class="footer-text">
                        &copy; 2026 Social Connect. All rights reserved.
                    </p>
                    <p class="footer-text">
                        Questions? <a href="mailto:support@socialconnect.app" class="footer-link">Contact our support team</a>
                    </p>
                    <p class="footer-text" style="margin-top: 15px; font-size: 11px;">
                        This is an automated message, please don't reply directly to this email.
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;
};
