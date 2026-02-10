'use client';

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f9f2f7] to-[#e8e4d5] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-[#1827a0]">
        <div className="mx-auto bg-[#f9f2f7] rounded-full p-4 w-24 h-24 flex items-center justify-center mb-6">
          <div className="text-4xl">🏗️</div>
        </div>
        
        <h1 className="text-3xl font-bold text-[#03034b] mb-4">Coming Soon</h1>
        <p className="text-lg text-[#1827a0] mb-6">
          We're working hard to bring you this feature. Stay tuned!
        </p>
        
        <div className="bg-[#e8e4d5] rounded-lg p-4 mb-6">
          <div className="h-2 bg-[#1827a0] rounded-full mb-2" style={{ width: '70%', marginLeft: 'auto' }}></div>
          <div className="h-2 bg-[#1827a0] rounded-full mb-2" style={{ width: '50%', marginLeft: 'auto' }}></div>
          <div className="h-2 bg-[#1827a0] rounded-full" style={{ width: '90%' }}></div>
        </div>
        
        <p className="text-gray-600 italic">
          This page is under construction and will be available in a future release.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;