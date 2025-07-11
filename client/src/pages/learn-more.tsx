import { Button } from "@/components/ui/button";
import { Coffee, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="coffee-gradient text-white rounded-lg p-1 mr-3">
                <svg width="35" height="35" viewBox="-25 -50 50 50" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
                  <path 
                    d="M -14 -13 A 50 32 0 0 1 -19 -41 C -16 -45 -14 -45 -10 -44 C -5 -42 0 -37 3 -34 C 6 -30 9 -26 11 -21 C 13 -16 13 -14 7 -11 C 3 -10 -2 -9 -8 -12 C -11 -15 -19 -21 -17 -31 C -14 -41 -7 -36 -7 -36 C -3 -34 3 -30 5 -24 C 6 -19 7 -14 3 -14 C -8 -13 -12 -20 -13 -22 C -15 -25 -16 -34 -9 -34 C -5 -35 1 -24 2 -21 C 4 -17 0 -14 -4 -17 C -13 -22 -14 -36 -7 -28 C -2 -24 -1 -20 -1 -18 C -1 -8 -10 -10 -14 -13" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-900">
                  <span className="text-roastah-teal italic">α</span>
                  <span className="text-gray-500">-</span>
                  <span className="font-roastah">roastah</span>
                </span>
                <span className="text-xs text-yellow-400 font-medium -mt-1">Experimental Alpha Release</span>
              </div>
            </Link>
            
            <Link to="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="coffee-gradient text-white rounded-lg p-2 mx-auto mb-4 w-fit">
              <svg width="56" height="56" viewBox="-25 -50 50 50" xmlns="http://www.w3.org/2000/svg" className="h-14 w-14">
                <path 
                  d="M -14 -13 A 50 32 0 0 1 -19 -41 C -16 -45 -14 -45 -10 -44 C -5 -42 0 -37 3 -34 C 6 -30 9 -26 11 -21 C 13 -16 13 -14 7 -11 C 3 -10 -2 -9 -8 -12 C -11 -15 -19 -21 -17 -31 C -14 -41 -7 -36 -7 -36 C -3 -34 3 -30 5 -24 C 6 -19 7 -14 3 -14 C -8 -13 -12 -20 -13 -22 C -15 -25 -16 -34 -9 -34 C -5 -35 1 -24 2 -21 C 4 -17 0 -14 -4 -17 C -13 -22 -14 -36 -7 -28 C -2 -24 -1 -20 -1 -18 C -1 -8 -10 -10 -14 -13" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Learn More</h1>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">A little backstory...</h2>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              Roastah didn't start in a boardroom. It started in a basement—surrounded by bags of green coffee, half-written roast logs, and the smell of something <em>becoming</em>.
            </p>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              The first time I tasted a home-roasted bean, it changed me. Not because it was perfect—it wasn't. But because someone had taken raw potential and turned it into something deeply personal. That bag, scrawled on with a gold paint pen, was my first window into a world that was chaotic, obsessive, and absolutely beautiful.
            </p>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              That was the spark.
            </p>
            
            <p className="text-gray-700 mb-8 leading-relaxed">
              Roastah was born from that moment—built not just for coffee drinkers, but for the ones who roast. The ones who tinker. Who chase the impossible "just right." Who fill notebooks with temps and charge rates and hit "first crack" like it's the drop in their favorite track.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-gray-700 mb-2 leading-relaxed">
                This isn't just software. It's a tribute.
              </p>
              <p className="text-gray-700 mb-2 leading-relaxed">
                To craft.
              </p>
              <p className="text-gray-700 mb-2 leading-relaxed">
                To community.
              </p>
              <p className="text-gray-700 leading-relaxed">
                To the long, winding road between green bean and greatness.
              </p>
            </div>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Roastah is (and isn't)</h2>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              Roastah is a living, breathing platform where roasters—from garages to cafés—can share, discover, and sell their work. It's a place to compare notes, track your journey, and support one another.
            </p>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              It's not venture-backed. It's not corporate.<br />
              It's indie. It's messy. It's roasting.
            </p>
            
            <p className="text-gray-700 mb-8 leading-relaxed">
              This is alpha. Expect bugs. Expect updates.<br />
              But most of all, expect heart.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Behind the Logo</h2>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              You might've noticed the scribble.
            </p>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              It's not a placeholder. It's the logo.
            </p>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              It was inspired by the very first bag of home-roasted beans I ever bought. The roaster had scrawled "El Salvador" on a matte black bag in gold ink. That little imperfection stuck with me. It felt <em>real</em>. Human.
            </p>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              Later, I came across a scientific image: the Lagrangian trajectory of tumbling coffee beans inside a roaster. It looked wild. Messy. But in its chaos, there was order. That, I realized, is what roasting is.
            </p>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              So I drew a scribble. A chaotic line that echoes that trajectory—a symbol of motion, imperfection, and intention.<br />
              That's the Roastah mark.
            </p>
            
            <p className="text-gray-700 mb-8 leading-relaxed">
              It's not polished. Not yet.<br />
              But neither is the roast. And that's kind of the point.
            </p>

            <hr className="my-8 border-gray-200" />

            <div className="text-center">
              <p className="text-gray-700 mb-4 leading-relaxed">
                Want to help shape what Roastah becomes?
              </p>
              <p className="text-xl font-semibold text-roastah-teal mb-8">
                This is the alpha. Welcome in.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/auth'}
                  size="lg"
                  className="bg-roastah-teal text-white hover:bg-roastah-dark-teal font-semibold"
                >
                  Join the Community
                </Button>
                <Link to="/">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-roastah-teal text-roastah-teal hover:bg-roastah-teal hover:text-white font-semibold"
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}