'use client'
import { useRouter } from 'next/navigation'
import React from 'react';

const NotFoundPage: React.FC = () => {
    const router = useRouter();
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-64 lg:px-8">
          <p className="text-base font-semibold leading-8 text-indigo-600">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Page not found</h1>
          <p className="mt-6 text-base leading-7 text-gray-600">Sorry, we couldn’t find the page you’re looking for.</p>
          <div className="mt-10">
            <a onClick={() => router.push('/')} className="text-sm font-semibold leading-7 text-indigo-600 cursor-pointer">
              <span aria-hidden="true">&larr;</span> Back to home
            </a>
          </div>
        </main>
    );
};

export default NotFoundPage;