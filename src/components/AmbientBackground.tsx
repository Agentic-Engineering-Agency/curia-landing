export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="curia-orb curia-orb-one absolute -left-32 top-24 h-[28rem] w-[28rem] max-w-[70vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(36,166,151,0.58),transparent_70%)] opacity-[0.14] blur-3xl" />
      <div className="curia-orb curia-orb-two absolute -right-36 top-[28rem] h-[32rem] w-[32rem] max-w-[75vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,167,91,0.5),transparent_70%)] opacity-[0.13] blur-3xl" />
      <div className="curia-orb curia-orb-three absolute left-[32%] top-[52%] h-[26rem] w-[26rem] max-w-[65vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(50,139,149,0.48),transparent_70%)] opacity-[0.12] blur-3xl" />
    </div>
  );
}
