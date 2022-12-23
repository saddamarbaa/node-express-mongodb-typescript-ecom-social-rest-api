export const promiseWrapper =
  (func: (arg0: any, arg1: any, arg2: any) => any) =>
  (req: any, res: any, next: () => ((reason: any) => PromiseLike<never>) | null | undefined) => {
    return Promise.resolve(func(req, res, next)).catch(next());
  };

export default promiseWrapper;
