import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "@base-ui/react/input";
import { Button } from "@base-ui/react/button";

const Register = () => {
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Registration From</CardTitle>
          <CardDescription>Resgiter Yout Info</CardDescription>
          <CardAction>Sign Up</CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">User</Label>
                <Input
                  id="name"
                  type="name"
                  placeholder="Enter Your Name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required placeholder="Enter Your Password" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="">
       <Button type="submit" className="w-full bg-slate-900 text-slate-50">
          Sign-Up
        </Button>
       
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
