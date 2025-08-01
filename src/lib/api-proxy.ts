import { Api } from "src/lib/api";
import { unwrap } from "src/lib/result";

function createServiceProxy<T extends keyof Api>(serviceName: T): Api[T] {
  return new Proxy({} as Api[T], {
    get(_, methodName: string | symbol) {
      if (typeof methodName === "string") {
        return async (...args: unknown[]) => {
          const channel = `${serviceName}:${methodName}`;
          const result: unknown = await window["electron"].ipcRenderer.invoke(
            channel,
            ...args,
          );

          if (
            result &&
            typeof result === "object" &&
            "_tag" in result &&
            result._tag === "Result"
          ) {
            // @ts-expect-error We know that result is a Result
            return unwrap(result);
          }

          return result;
        };
      }

      throw new Error(`Unknown method: ${JSON.stringify(methodName)}`);
    },
  });
}

export const api: Api = {
  decks: createServiceProxy("decks"),
  cards: createServiceProxy("cards"),
};
