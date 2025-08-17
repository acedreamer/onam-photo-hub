import { MadeWithDyad } from "@/components/made-with-dyad";

const About = () => {
  return (
    <div className="text-left max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-leaf-green mb-4 text-center">About Onam Photo Hub</h1>
      <p className="text-gray-700 mb-4">
        This platform is a community photo sharing space designed specifically for Onam festival celebrations at colleges. It's a lightweight, cultural hub where students can instantly capture and share their festival moments.
      </p>
      <p className="text-gray-700 mb-4">
        The goal is to create a real-time gallery of celebration moments, from intricate Pookalams and traditional attire to energetic performances and delicious Sadhyas.
      </p>
      <div className="mt-12">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default About;