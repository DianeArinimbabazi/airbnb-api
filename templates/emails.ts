import { sendEmail } from "./utils/mailer";

async function test() {
  try {
    await sendEmail(
      "yourgmail@gmail.com",
      "Test Email",
      "Hello! Email is working 🎉"
    );

    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email failed:", err);
  }
}

test();