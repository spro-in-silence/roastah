interface CoffeeRoasterLoaderProps {
  className?: string;
}

export function CoffeeRoasterLoader({ className = "w-16 h-16" }: CoffeeRoasterLoaderProps) {
  return (
    <div className={`${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Coffee Roaster Drum - Circle outline only */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#d97706"
          strokeWidth="4"
          className="animate-spin"
          style={{
            transformOrigin: '50px 50px',
            animationDuration: '2s',
            animationDirection: 'normal'
          }}
        />
        
        {/* Inner drum details */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="#b45309"
          strokeWidth="2"
          opacity="0.6"
          className="animate-spin"
          style={{
            transformOrigin: '50px 50px',
            animationDuration: '2s',
            animationDirection: 'normal'
          }}
        />
        
        {/* Coffee beans bouncing up and down */}
        <g>
          {/* Bean 1 */}
          <ellipse cx="45" cy="50" rx="3" ry="5" fill="#8b4513" transform="rotate(15 45 50)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -15; 0 0"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* Bean 2 */}
          <ellipse cx="55" cy="50" rx="3" ry="5" fill="#654321" transform="rotate(45 55 50)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -12; 0 0"
              dur="1.0s"
              repeatCount="indefinite"
              begin="0.2s"
            />
          </ellipse>
          
          {/* Bean 3 */}
          <ellipse cx="50" cy="45" rx="3" ry="5" fill="#8b4513" transform="rotate(75 50 45)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -18; 0 0"
              dur="1.4s"
              repeatCount="indefinite"
              begin="0.4s"
            />
          </ellipse>
          
          {/* Bean 4 */}
          <ellipse cx="40" cy="55" rx="3" ry="5" fill="#654321" transform="rotate(120 40 55)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -10; 0 0"
              dur="0.8s"
              repeatCount="indefinite"
              begin="0.6s"
            />
          </ellipse>
          
          {/* Bean 5 */}
          <ellipse cx="60" cy="45" rx="3" ry="5" fill="#8b4513" transform="rotate(200 60 45)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -14; 0 0"
              dur="1.1s"
              repeatCount="indefinite"
              begin="0.8s"
            />
          </ellipse>
          
          {/* Bean 6 */}
          <ellipse cx="48" cy="55" rx="3" ry="5" fill="#654321" transform="rotate(300 48 55)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 -16; 0 0"
              dur="1.3s"
              repeatCount="indefinite"
              begin="1.0s"
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