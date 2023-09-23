"use client";

import { useState } from "react";
import { trpc } from "../_trpc/client";
import { serverClient } from "../_trpc/_serverClient";

export default function TodoList({
  initialTodos,
}: {
  initialTodos: Awaited<ReturnType<(typeof serverClient)["getTodos"]>>;
}) {
  const getTodos = trpc.getTodos.useQuery(undefined, {
    initialData: initialTodos,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const addTodo = trpc.addTodo.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });
  const setDone = trpc.setDone.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });

  const [content, setContent] = useState("");

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content.length) {
      addTodo.mutate(content);
      setContent("");
    }
  };
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-white my-5 text-3xl">
        {getTodos?.data?.map((todo) => (
          <div className="flex gap-3 items-center" key={todo.id}>
            <input
              type="checkbox"
              id={`check-${todo.id}`}
              checked={!!todo.done}
              style={{ zoom: 1.5 }}
              onChange={async () => {
                setDone.mutate({
                  id: todo.id,
                  done: todo.done ? 0 : 1,
                });
              }}
            />
            <label htmlFor={`check-${todo.id}`}>{todo.content}</label>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="w-full flex justify-center items-center gap-4">
        <label htmlFor="content" className="text-xl">
          Content:
        </label>
        <input
          type="text"
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-slate-900 border-slate-800 border-solid border-2 rounded-lg p-2"
        />
        <button type="submit" className="bg-blue-950 px-4 py-2 rounded-xl">
          Add Todo
        </button>
      </form>
    </div>
  );
}
