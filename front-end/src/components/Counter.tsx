// import { useState, useEffect } from "react";

// export default function counter() {
//   const initialState = () => Number(window.localStorage.getItem("count")) || 0;
//   const [count, setCount] = useState(initialState);

//   useEffect(() => {
//     window.localStorage.setItem("count", count.toString());
//   }, [count]);

//   return (
//     <>
//       <p>Points : {count}</p>
//       <button onClick={() => setCount(count + 20)}>Increase</button>
//       <button onClick={() => setCount(count - count)}>Reset</button>
//     </>
//   );
// }

import React from "react";
import { useState, useEffect } from "react";

type CounterProps = {};

const initialState = () => Number(window.localStorage.getItem("count")) || 0;

export function Counter() {
  const [count, setCount] = useState(initialState);

  useEffect(() => {
    window.localStorage.setItem("count", count.toString());
  }, [count]);

  return (
    <>
      <p>Points : {count}</p>
      <button onClick={() => setCount(count + 20)}>Increase</button>
      <button onClick={() => setCount(count - count)}>Reset</button>
    </>
  );
}

// const Counter: React.FC<CounterProps> = () => {
//   return (
//     <>
//       <p>Points : {count}</p>
//       <button onClick={() => setCount(count + 20)}>Increase</button>
//       <button onClick={() => setCount(count - count)}>Reset</button>
//     </>
//   );
// };
export default Counter;
