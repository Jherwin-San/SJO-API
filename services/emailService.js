const nodemailer = require('nodemailer');

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Your SMTP server hostname
  port: 587, // Your SMTP server port
  secure: false, // Set to true if your SMTP server requires TLS
  auth: {
    user: `${process.env.STMP_EMAIL}`, // Your SMTP username
    pass: `${process.env.STMP_PASSWORD}` // Your SMTP password
  }
});

// Function to send welcome email
module.exports.sendWelcomeEmail = async (email) => {
  try {
    // Send email
    await transporter.sendMail({
      from: 'SJO@ecommerce.com', // Sender address
      to: email, // Recipient address
      subject: 'Welcome to Our Service', // Subject line
      text: 'Thank you for registering with us! Welcome aboard.' // Plain text body
    });
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

module.exports.sendPasswordUpdateEmail = async (email) => {
  try {
    // Define email options
    const mailOptions = {
      from: 'SJO@ecommerce.com',
      to: email,
      subject: 'Password Update Notification',
      text: 'Your password has been successfully updated.'
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Password update email sent successfully');
  } catch (error) {
    console.error('Error sending password update email:', error);
    throw error; // Propagate the error to the calling function
  }
};

module.exports.sendOrderConfirmationMail = async (email) => {
  try {
    // Define email options
    const mailOptions = {
      from: 'SJO@ecommerce.com',
      to: email,
      subject: 'Order Confirmation',
      text: 'Your order has been placed.'
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error; // Propagate the error to the calling function
  }
};