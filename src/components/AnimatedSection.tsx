import { PropsWithChildren } from 'react';

export default function AnimatedSection({ children }: PropsWithChildren) {
  return (
    <div className="animate-fade-in-up [animation-duration:800ms]">
      {children}
    </div>
  );
}
