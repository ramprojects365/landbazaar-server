import { Router, Request, Response } from 'express';
import { sendContactMessageEmail } from '../services/emailService.js';

const router = Router();

const emailPattern = /^[^\s@]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const phonePattern = /^[0-9]{10,12}$/;
const namePattern = /^(?![0-9])(?=.*[A-Za-z])[A-Za-z\s.'-]{2,60}$/;

const clean = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const hasMeaningfulText = (value: string, max: number): boolean =>
  value.length > 0 &&
  value.length <= max &&
  /[A-Za-z]/.test(value) &&
  /[A-Za-z0-9]/.test(value);

router.post('/', async (req: Request, res: Response) => {
  const name = clean(req.body?.name);
  const email = clean(req.body?.email);
  const phone = clean(req.body?.phone);
  const subject = clean(req.body?.subject);
  const message = clean(req.body?.message);
  const source = clean(req.body?.source);

  if (name && !namePattern.test(name)) {
    res.status(400).json({ success: false, message: 'Enter a valid name' });
    return;
  }

  if (!emailPattern.test(email)) {
    res.status(400).json({ success: false, message: 'Enter a valid email address' });
    return;
  }

  if (!phonePattern.test(phone)) {
    res.status(400).json({ success: false, message: 'Phone number must be 10 to 12 digits' });
    return;
  }

  if (subject && !hasMeaningfulText(subject, 120)) {
    res.status(400).json({ success: false, message: 'Enter a valid subject' });
    return;
  }

  if (!hasMeaningfulText(message, 1000)) {
    res.status(400).json({ success: false, message: 'Enter a valid message' });
    return;
  }

  try {
    await sendContactMessageEmail({
      name: name || email.split('@')[0] || 'Website visitor',
      email,
      phone,
      subject,
      message,
      source,
    });

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact message failed:', error);
    res.status(500).json({ success: false, message: 'Message could not be sent' });
  }
});

export default router;
