import { useNavigate } from "react-router-dom";

export default function HomeButton() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center">
      <button
        className="font-bold border-transparent p-4 px-10 my-4 rounded-xl text-3xl text-indigo-500 bg-slate-300/30"
        onClick={() => navigate("/")}
      >
        atoma home
      </button>
    </div>
  );
}
