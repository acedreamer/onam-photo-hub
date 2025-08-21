import { Github } from 'lucide-react';

const About = () => {
  return (
    <div className="text-left max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-dark-leaf-green mb-6 text-center font-serif">About Onam Photo Hub</h1>
      <p className="text-neutral-gray mb-4 leading-relaxed">
        This platform is a community photo sharing space designed specifically for Onam festival celebrations at colleges. It's a lightweight, cultural hub where students can instantly capture and share their festival moments.
      </p>
      <p className="text-neutral-gray mb-4 leading-relaxed">
        The goal is to create a real-time gallery of celebration moments, from intricate Pookalams and traditional attire to energetic performances and delicious Sadhyas.
      </p>
      <div className="text-center mt-12 pt-6 border-t">
        <p className="text-neutral-gray mb-2">
          Crafted with ❤️ by a passionate developer.
        </p>
        <a
          href="https://github.com/acedreamer"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline font-medium"
        >
          <Github className="h-5 w-5 mr-2" />
          Explore the code on GitHub
        </a>
      </div>
    </div>
  );
};

export default About;