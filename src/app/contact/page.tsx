import { handleMail } from '@/app/contact/emails';

export default function Contact() {
  const formElementStyles = 'flex flex-col gap-1 w-full text-left';
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h1 className="text-light dark:text-dark">Contact me!</h1>
      <form action={handleMail} className="flex flex-col gap-2">
        <span className={formElementStyles}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full"
            required
          />
        </span>
        <span className={formElementStyles}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </span>
        <span className={formElementStyles}>
          <label htmlFor="subject">Subject</label>
          <input id="subject" name="subject" type="text" required />
        </span>
        <span className={formElementStyles}>
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" required />
        </span>
        <button type="submit" className="bg-red-100">
          Send
        </button>
      </form>
    </div>
  );
}
