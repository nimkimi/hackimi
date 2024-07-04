"use server";
import { sendMail } from "@/services/emailServices";

export async function handleMail(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const otpText = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
  await sendMail(
    `Svar til ${name}`,
    email,
    `Hei ${name},\n\nTakk for din henvendelse. Jeg vil svare deg så snart som mulig.\n\nMed vennlig hilsen,\nNima Hakimi`
  );
  await sendMail(subject, "nima@hackimi.dev", otpText);
}
