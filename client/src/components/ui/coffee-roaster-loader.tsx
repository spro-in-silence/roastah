interface CoffeeRoasterLoaderProps {
  className?: string;
}

export function CoffeeRoasterLoader({ className = "w-8 h-8" }: CoffeeRoasterLoaderProps) {
  return (
    <div className={`${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Coffee Roaster Drum */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="#d97706"
          stroke="#b45309"
          strokeWidth="2"
          className="animate-spin"
          style={{
            transformOrigin: '50px 50px',
            animationDuration: '2s'
          }}
        />
        
        {/* Drum details */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="#b45309"
          strokeWidth="1"
          opacity="0.6"
          className="animate-spin"
          style={{
            transformOrigin: '50px 50px',
            animationDuration: '2s'
          }}
        />
        
        {/* Coffee beans inside */}
        <g className="animate-spin" style={{
          transformOrigin: '50px 50px',
          animationDuration: '1.5s',
          animationDirection: 'reverse'
        }}>
          {/* Bean 1 */}
          <ellipse cx="45" cy="40" rx="3" ry="5" fill="#8b4513" transform="rotate(15 45 40)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="15 45 40;375 45 40"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* Bean 2 */}
          <ellipse cx="55" cy="45" rx="3" ry="5" fill="#654321" transform="rotate(45 55 45)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="45 55 45;405 55 45"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* Bean 3 */}
          <ellipse cx="50" cy="55" rx="3" ry="5" fill="#8b4513" transform="rotate(75 50 55)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="75 50 55;435 50 55"
              dur="1.3s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* Bean 4 */}
          <ellipse cx="40" cy="52" rx="3" ry="5" fill="#654321" transform="rotate(120 40 52)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="120 40 52;480 40 52"
              dur="1.7s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* Bean 5 */}
          <ellipse cx="60" cy="55" rx="3" ry="5" fill="#8b4513" transform="rotate(200 60 55)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="200 60 55;560 60 55"
              dur="1.4s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* Bean 6 */}
          <ellipse cx="48" cy="42" rx="3" ry="5" fill="#654321" transform="rotate(300 48 42)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="300 48 42;660 48 42"
              dur="1.6s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
        
        {/* Roaster handle */}
        <rect
          x="88"
          y="48"
          width="8"
          height="4"
          fill="#b45309"
          rx="2"
        />
        
        {/* Heat indicator dots */}
        <circle cx="50" cy="25" r="1.5" fill="#ef4444" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="45" cy="27" r="1" fill="#f97316" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="55" cy="27" r="1" fill="#fbbf24" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="0.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}