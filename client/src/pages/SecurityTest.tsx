import { RickrollTest } from "@/components/security/RickrollTest";

export function SecurityTest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Security Test Suite
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Test the wallet security system and DEX blacklist protection. 
            Try entering known DEX contract addresses to see the rickroll protection in action.
          </p>
        </div>
        
        <RickrollTest />
      </div>
    </div>
  );
}