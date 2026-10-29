import type { FullPost } from "../../features/post";
import type { UsedPostProps } from "../Post";
import Post from "../Post";

function ThePost(props: UsedPostProps) {
  const startYear = 2011;
  const digitalStartYear = 2020;

  const drawingFor = Math.round(new Date().getFullYear() - startYear);
  const drawingDigitalFor = Math.round(
    new Date().getFullYear() - digitalStartYear,
  );

  return (
    <Post {...props}>
      <p>
        Do you draw? Odds are that you don't. And that's okay! Most people
        don't.
      </p>
      <p>But maybe most people should...</p>
      <p>
        I think I should give some background on myself before I go about
        spewing artist indoctrination regimes. I've been drawing for effectively{" "}
        {drawingFor} years. And that doesn't mean doodles or scribbles every
        once in a while. For a majority of this time, its been art instruction
        under quite a few art teachers in the Bay Area. I can't really put a
        rubric on art skills and techniques, so here's what I have extensive
        experience in:
      </p>
      <ul className="list-disc list-inside pl-6">
        <li>Pencil sketching</li>
        <li>Pencil shading</li>
        <li>Acrylic painting</li>
        <li>Colored pencils</li>
      </ul>
      <p>
        I've done a lot more than this like watercolor, oil painting, pastels,
        gouache, random stuff. But that's not my main expertise.
      </p>
      <p>
        I've also been drawing digitally for about {drawingDigitalFor} years as
        well. Here's a shameless plug to my{" "}
        <a href="https://12jeef.github.io/gallery/">digital art gallery</a> and
        my <a href="https://www.instagram.com/jeefdraws/">Instagram account</a>.
      </p>
      <p>Okay, with that out of the way. Why art?</p>
      <h2 className="text-fg1 text-xl font-bold">1. It's cool</h2>
      <p>
        I mean, come on! Art is cool! You are translating a funky three
        dimensional understanding of the world into a two dimensional figure.
        There's the obvious practice in hand-eye coordination, moving your hand
        to exactly where you want it to and need it to. There's understanding
        how the medium flows, crumbles, melts on the page. There's actually
        being able to see colors and shapes for what they truly are in front of
        you.
      </p>
      <p>
        There's skill and it's hard, but not impossible. And it rapidly changes
        how you see the world. You actually understand why something looks
        pretty. You understand what you are seeing in front of you.
      </p>
      <h2 className="text-fg1 text-xl font-bold">
        2. It's good for understanding stuff
      </h2>
      <p>
        If you've ever actually drawn things before, you know that if you really
        want something to look cohesive, you gotta do the "step back and take a
        look" thing. Lean back and look at the whole piece. Or zoom out, if
        you're on a tablet.
      </p>
      <p>
        A lot of STEM makes you zoom all the way in. You need to know the nitty
        gritty science. You need to know the details of how every biological,
        chemical, physical, mechanical, electrical system works. You're stuck on
        the tiny scale, focusing on obstacles that seem too big.
      </p>
      <p>
        But from that perspective, nothing really makes sense. You <i>need</i>{" "}
        to zoom out. You <i>need</i> to see the bigger picture. How else are you
        going to practice that instinctively other than when drawing stuff.
      </p>
      <h2 className="text-fg1 text-xl font-bold">3. It's a good break</h2>
      <p>
        Imagine this nightmare scenario. All your devices are dead. No phone, no
        laptop, no tablet, no headphones. No internet. And the next time you
        have access to a charger or battery pack is in a couple hours. What do
        you do? What <i>can</i> you do?
      </p>
      <p>Draw.</p>
      <p>
        Bring a tiny sketchbook with you everywhere. There's ones that can fit
        in a pocket if that's all you carry. Backpack? Easy. Purse? Absolutely.
        Have a pencil or pen with you at all times. C'mon, it takes up zero
        space.
      </p>
      <p>
        Just sitting in one location and drawing what you see in front of you
        grounds you in your surroundings. You're kind of forced to notice what's
        there. And by doing that, you can calm down, focus, and reflect. Not
        necessarily consciously reflect, but unconciously. And that's okay.
      </p>
      <p>
        You might have some spectators if you're out drawing. That's okay! They
        never mean any harm and are more fascinated than judgy.
      </p>
      <h2 className="text-fg1 text-xl font-bold">Should I start?</h2>
      <p>
        Absolutely! Start early. It doesn't have to be grindy or super
        professional. A lot of what I learned about anatomy, how to draw hands,
        color theory, are all from just drawing and messing around. Sometimes
        searching up some references.
      </p>
      <p>
        <span className="text-fg1">
          <b>Concerned about time?</b>
        </span>{" "}
        Don't be. You don't have to sink hours and hours of time into it. None
        of the skills I just mentioned above necessarily need you to be insane
        at art. You don't need to be able to draw 1:1 what you see in front of
        you. You don't need to be able to whip out a sketch in less than 10
        minutes. You don't need to be able to produce an absolute color-theory
        masterpiece. You just need to spend some time drawing. Notice when
        you're bored, and replace that with drawing.
      </p>
      <p>
        <span className="text-fg1">
          <b>Concerned about costs?</b>
        </span>{" "}
        After all, colored pencils are expensive. Acrylic more so. Oil painting
        is impossible. A whole easel? Stacks of canvas? Sketchbooks with fancy
        paper? Art supplies are expensive, yes. But you don't need them. I've
        drawn what I consider some of my best stuff with your standard #2 yellow
        pencils on binder paper. I've scribbled some cool things with burnt
        marshmallow sticks on concrete pavement. Fancy supplies are overrated.
        Use what you have. That's art.
      </p>
      <p>
        Art should not be exclusive to the few. You have the power to improve
        yourself and the lives of others through creation. Start now. Not later.
      </p>
      <p>Now go forth, and happy sketching!</p>
    </Post>
  );
}

const OnArt: FullPost = {
  name: "on-art",
  title: "On Art",
  date: [2026, 10, 29],
  post: ThePost,
};

export default OnArt;
