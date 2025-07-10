interface CoffeeRoasterLoaderProps {
  className?: string;
}

export function CoffeeRoasterLoader({
  className = "w-16 h-16",
}: CoffeeRoasterLoaderProps) {
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
            transformOrigin: "50px 50px",
            animationDuration: "2s",
            animationDirection: "normal",
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
            transformOrigin: "50px 50px",
            animationDuration: "2s",
            animationDirection: "normal",
          }}
        />

        {/* 25 Coffee beans with 6 different chaotic paths randomly distributed */}
        <g>
          {/* Bean 1 - Path 1 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.1s"
              path="M 0 0 A 50 32 0 0 1 -11 -50 L 0 0"
            />
          </ellipse>

          {/* Bean 2 - Path 2 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.3s"
              path="M 0 0 A 50 32 0 0 1 -8 -49 L 0 0"
            />
          </ellipse>

          {/* Bean 3 - Path 3 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.7s"
              path="M 0 0 A 50 32 0 0 1 -12 -48 L 0 0"
            />
          </ellipse>

          {/* Bean 4 - Path 4 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="1.2s"
              path="M 0 0 A 50 32 0 0 1 -14 -45 L 2 -1"
            />
          </ellipse>

          {/* Bean 5 - Path 5 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.9s"
              path="M 1 0 A 50 32 0 0 1 -5 -48 L 2 -2"
            />
          </ellipse>

          {/* Bean 6 - Path 6 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="1.8s"
              path="M 1 0 A 50 32 0 0 1 -5 -48 L -8 -8"
            />
          </ellipse>

          {/* Bean 7 - Path 2 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.4s"
              path="M 0 0 A 50 32 0 0 1 -8 -49 L 0 0"
            />
          </ellipse>

          {/* Bean 8 - Path 5 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="2.1s"
              path="M 1 0 A 50 32 0 0 1 -5 -48 L 2 -2"
            />
          </ellipse>

          {/* Bean 9 - Path 1 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.6s"
              path="M 0 0 A 50 32 0 0 1 -11 -50 L 0 0"
            />
          </ellipse>

          {/* Bean 10 - Path 3 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="1.5s"
              path="M 0 0 A 50 32 0 0 1 -12 -48 L 0 0"
            />
          </ellipse>

          {/* Bean 11 - Path 6 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.2s"
              path="M 1 0 A 50 32 0 0 1 -5 -48 L -8 -8"
            />
          </ellipse>

          {/* Bean 12 - Path 4 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="1.9s"
              path="M 0 0 A 50 32 0 0 1 -14 -45 L 2 -1"
            />
          </ellipse>

          {/* Bean 13 - Path 1 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.8s"
              path="M 0 0 A 50 32 0 0 1 -11 -50 L 0 0"
            />
          </ellipse>

          {/* Bean 14 - Path 2 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="1.3s"
              path="M 0 0 A 50 32 0 0 1 -8 -49 L 0 0"
            />
          </ellipse>

          {/* Bean 15 - Path 3 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.5s"
              path="M 0 0 A 50 32 0 0 1 -12 -48 L 0 0"
            />
          </ellipse>

          {/* Bean 16 - Path 6 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="2.2s"
              path="M 1 0 A 50 32 0 0 1 -5 -48 L -8 -8"
            />
          </ellipse>

          {/* Bean 17 - Path 4 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="1.1s"
              path="M 0 0 A 50 32 0 0 1 -14 -45 L 2 -1"
            />
          </ellipse>

          {/* Bean 18 - Path 5 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="1.7s"
              path="M 1 0 A 50 32 0 0 1 -5 -48 L 2 -2"
            />
          </ellipse>

          {/* Bean 19 - Path 1 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.35s"
              path="M 0 0 A 50 32 0 0 1 -11 -50 L 0 0"
            />
          </ellipse>

          {/* Bean 20 - Path 3 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="1.4s"
              path="M 0 0 A 50 32 0 0 1 -12 -48 L 0 0"
            />
          </ellipse>

          {/* Bean 21 - Path 2 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.65s"
              path="M 0 0 A 50 32 0 0 1 -8 -49 L 0 0"
            />
          </ellipse>

          {/* Bean 22 - Path 6 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="2.0s"
              path="M 1 0 A 50 32 0 0 1 -5 -48 L -8 -8"
            />
          </ellipse>

          {/* Bean 23 - Path 4 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.85s"
              path="M 0 0 A 50 32 0 0 1 -14 -45 L 2 -1"
            />
          </ellipse>

          {/* Bean 24 - Path 5 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#654321">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="1.6s"
              path="M 1 0 A 50 32 0 0 1 -5 -48 L 2 -2"
            />
          </ellipse>

          {/* Bean 25 - Path 1 */}
          <ellipse cx="48" cy="80" rx="2" ry="3" fill="#8b4513">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.45s"
              path="M 0 0 A 50 32 0 0 1 -11 -50 L 0 0"
            />
          </ellipse>
        </g>

        {/* Heat indicator dots - 8 dots */}
        <circle cx="50" cy="25" r="1.5" fill="#ef4444" opacity="0.8">
          <animate
            attributeName="opacity"
            values="0.8;0.3;0.8"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="45" cy="27" r="1" fill="#f97316" opacity="0.6">
          <animate
            attributeName="opacity"
            values="0.6;0.2;0.6"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="55" cy="27" r="1" fill="#fbbf24" opacity="0.7">
          <animate
            attributeName="opacity"
            values="0.7;0.3;0.7"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="40" cy="30" r="1.2" fill="#dc2626" opacity="0.9">
          <animate
            attributeName="opacity"
            values="0.9;0.4;0.9"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="60" cy="30" r="1.2" fill="#ea580c" opacity="0.5">
          <animate
            attributeName="opacity"
            values="0.5;0.1;0.5"
            dur="0.9s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="47" cy="23" r="0.8" fill="#f59e0b" opacity="0.8">
          <animate
            attributeName="opacity"
            values="0.8;0.2;0.8"
            dur="1.1s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="53" cy="23" r="0.8" fill="#f97316" opacity="0.6">
          <animate
            attributeName="opacity"
            values="0.6;0.3;0.6"
            dur="1.3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="50" cy="20" r="1" fill="#dc2626" opacity="0.7">
          <animate
            attributeName="opacity"
            values="0.7;0.2;0.7"
            dur="0.7s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
