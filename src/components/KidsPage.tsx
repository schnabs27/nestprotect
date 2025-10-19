import { Card, CardContent } from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
import nestorSuperhero from "/images/nestor-superhero.png";
import letterA from "@/assets/abc-letter-a.png";
import letterB from "@/assets/abc-letter-b.png";
import letterC from "@/assets/abc-letter-c.png";

const KidsPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Banner Image */}
        <div className="flex justify-center">
          <img
            src={nestorSuperhero}
            alt="Nestor the Superhero Bird"
            className="w-48 h-48 rounded-full object-cover"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-foreground">
          Emergency ABCs!
        </h1>

        {/* Intro Paragraph */}
        <p className="text-center text-lg">
          Kids, you can be a <strong>superhero</strong> in an emergency by remembering these ABCs!
        </p>

        {/* ABC Cards */}
        <div className="space-y-6">
          {/* A - Adult */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <img src={letterA} alt="Letter A" className="w-24 h-24" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Adult</h2>
                <p className="text-base">
                  Find an <strong>adult</strong> you trust, like your parent or teacher. If you get lost, look for the police to help.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* B - Bag */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <img src={letterB} alt="Letter B" className="w-24 h-24" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Bag</h2>
                <p className="text-base">
                  A "go-bag" is a bag or backpack to take when you go somewhere safe. Fill it with your favorite toy or book, a flashlight, an extra shirt, and a snack. You're set!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* C - Cover & Stay Safe */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <img src={letterC} alt="Letter C" className="w-24 h-24" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Cover & Stay Safe!</h2>
                <p className="text-base">
                  Go with your adult to your cover up in your safe place until it's okay.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <p className="text-center text-lg font-medium mt-8">
          Ask your parents to practice. It can be fun!
        </p>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default KidsPage;
