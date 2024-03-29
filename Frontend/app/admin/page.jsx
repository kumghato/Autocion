"use client";
import Image from "next/image";
import logo from "../../public/assets/logo_black.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function page() {
  const router = useRouter();
  const [user, setUser] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const handleChange = (e) => {
    setUser(() => ({ ...user, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${process.env.API_KEY}/api/v1/login/user`, {
      method: "POST",
      headers: {
        Authorization: `token`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(user).toString(),
    });
    const data = await response.json();
    if (data.status === 1) {
      if (data.user.role === "admin") {
        toast.success("Login successfull");
        setUser({ ...user });
        Cookies.set("admin", data.token);
        router.push("/admin/dashboard");
        return;
      } else {
        setError("Unauthorized");
      }
    } else {
      setError("Incorrect credentials, please try again.");
    }
  };
  return (
    <main className="admin_login_container">
      <div className="admin_login_card">
        <div>
          <Image src={logo} width={500} height={300} alt="logo" />
          <form action="Post">
            <input
              onChange={handleChange}
              name="phone"
              type="number"
              placeholder="Phone"
            />
            <input
              onChange={handleChange}
              name="password"
              type="password"
              placeholder="Password"
            />
            <button type="submit" onClick={handleSubmit}>
              Login
            </button>
          </form>
          <p className="error">{error}</p>
        </div>
      </div>
    </main>
  );
}
