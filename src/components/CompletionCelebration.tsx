const CompletionCelebration = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 animate-celebration">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-punch-success mb-2">
            Card Complete!
          </h2>
          <p className="text-gray-600">
            Starting a new card...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletionCelebration;
