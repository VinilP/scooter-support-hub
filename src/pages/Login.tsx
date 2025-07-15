import MobileAuth from "@/components/MobileAuth";
import FloatingChatWidget from "@/components/FloatingChatWidget";

const Login = () => {
  return (
    <div className="min-h-screen">
      <MobileAuth />
      <FloatingChatWidget />
    </div>
  );
};

export default Login;