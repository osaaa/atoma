import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { Routes, Route, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  return (
    <>
      <div className="min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-screen flex justify-center items-center text-white">
                <div className="my-1 flex flex-col justify-center items-center w-fit">
                  <p className="text-4xl ">welcome to atoma.</p>
                  <p>atomic structure for better habits</p>
                  <div className="text-xl flex flex-row gap-1 p-2">
                    <button
                      className="border p-2 rounded-2xl"
                      onClick={() => navigate("/signup")}
                    >
                      sign up
                    </button>
                    <button
                      className="border p-2 rounded-2xl"
                      onClick={() => navigate("/signin")}
                    >
                      sign in
                    </button>
                  </div>
                </div>
              </div>
            }
          />

          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
