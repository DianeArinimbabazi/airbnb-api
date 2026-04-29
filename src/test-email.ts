import { sendEmail } from "./utils/mailer";
import { welcomeEmail } from "./templates/emails";

async function test() {
  try {
    await sendEmail(
      "arinidiannah@gmail.com",
      "Test Email",
      welcomeEmail("Diane", "GUEST")
    );

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email failed:", error);
  }
}

test();