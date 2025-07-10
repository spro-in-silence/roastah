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
        {/* Coffee Roaster Drum - Circle with gap */}
        <path
          d="M 50 10 A 40 40 0 1 1 47 10"
          fill="none"
          stroke="#d97706"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-spin"
          style={{
            transformOrigin: '50px 50px',
            animationDuration: '2s',
            animationDirection: 'normal'
          }}
        />
        
        {/* Inner drum details with gap */}
        <path
          d="M 50 15 A 35 35 0 1 1 47.5 15"
          fill="none"
          stroke="#b45309"
          strokeWidth="2"
          opacity="0.6"
          strokeLinecap="round"
          className="animate-spin"
          style={{
            transformOrigin: '50px 50px',
            animationDuration: '2s',
            animationDirection: 'normal'
          }}
        />
        
        {/* Coffee beans following arc from 6 o'clock to 11 o'clock */}
        <g>
          {/* Bean 1 - Arc motion from 6 o'clock to 11 o'clock */}
          <ellipse cx="50" cy="85" rx="3" ry="5" fill="#8b4513">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M 0,0 L 5,-5 L 10,-15 L 15,-25 L 20,-30 L 25,-25 L 30,-15 L 35,-5 L 40,0 L 35,5 L 30,10 L 25,15 L 20,20 L 15,25 L 10,15 L 5,5 L 0,0 Z"
            />
          </ellipse>
          
          {/* Bean 2 - Arc motion with delay */}
          <ellipse cx="50" cy="85" rx="3" ry="5" fill="#654321">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin="0.5s"
              path="M 0,0 L 5,-5 L 10,-15 L 15,-25 L 20,-30 L 25,-25 L 30,-15 L 35,-5 L 40,0 L 35,5 L 30,10 L 25,15 L 20,20 L 15,25 L 10,15 L 5,5 L 0,0 Z"
            />
          </ellipse>
          
          {/* Bean 3 - Arc motion with delay */}
          <ellipse cx="50" cy="85" rx="3" ry="5" fill="#8b4513">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin="1s"
              path="M 0,0 L 5,-5 L 10,-15 L 15,-25 L 20,-30 L 25,-25 L 30,-15 L 35,-5 L 40,0 L 35,5 L 30,10 L 25,15 L 20,20 L 15,25 L 10,15 L 5,5 L 0,0 Z"
            />
          </ellipse>
          
          {/* Bean 4 - Arc motion with delay */}
          <ellipse cx="50" cy="85" rx="3" ry="5" fill="#654321">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin="1.5s"
              path="M 0,0 L 5,-5 L 10,-15 L 15,-25 L 20,-30 L 25,-25 L 30,-15 L 35,-5 L 40,0 L 35,5 L 30,10 L 25,15 L 20,20 L 15,25 L 10,15 L 5,5 L 0,0 Z"
            />
          </ellipse>
          
          {/* Bean 5 - Arc motion with delay */}
          <ellipse cx="50" cy="85" rx="3" ry="5" fill="#8b4513">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin="2s"
              path="M 0,0 L 5,-5 L 10,-15 L 15,-25 L 20,-30 L 25,-25 L 30,-15 L 35,-5 L 40,0 L 35,5 L 30,10 L 25,15 L 20,20 L 15,25 L 10,15 L 5,5 L 0,0 Z"
            />
          </ellipse>
          
          {/* Bean 6 - Arc motion with delay */}
          <ellipse cx="50" cy="85" rx="3" ry="5" fill="#654321">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              begin="2.5s"
              path="M 0,0 L 5,-5 L 10,-15 L 15,-25 L 20,-30 L 25,-25 L 30,-15 L 35,-5 L 40,0 L 35,5 L 30,10 L 25,15 L 20,20 L 15,25 L 10,15 L 5,5 L 0,0 Z"
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