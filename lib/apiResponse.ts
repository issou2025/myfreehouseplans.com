import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string>;
};

export function jsonSuccess<T>(message: string, data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, message, data }, { status });
}

export function jsonError(message: string, status = 400, errors?: Record<string, string>) {
  return NextResponse.json<ApiError>({ success: false, message, errors }, { status });
}
