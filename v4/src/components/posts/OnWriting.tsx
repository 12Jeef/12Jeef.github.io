import type { FullPost } from "../../features/post";
import type { UsedPostProps } from "../Post";
import Post from "../Post";

function ThePost(props: UsedPostProps) {
  return (
    <Post {...props}>
      <p>
        I like explaining things. I've been told by many people, friends,
        family, people I've worked with in teams and in partnerships and groups
        and everything in between, that I explain things clearly. Let me see if
        I can convince you that I'm at least not horrible at explanations.
      </p>
      <p>
        How about let's try to explain how neurons work. For the intended
        audience of a fresh high school graduate.
      </p>
      <blockquote className="p-4 bg-mgaa italic">
        You got these little cells called neurons. They're really long. All
        along their surface, they got these tiny pumps that shove out atoms from
        inside the cell to the outside. Those atoms want to get back in. It's
        too stuffy outside. But they can't, 'cause the return gates are closed.
        But then, a special molecule comes by and sticks to those gates, prying
        them open. Atoms flood in. That flood causes some gates nearby to also
        open up. This chain reaction of flooding atoms and opening gates travels
        along the neuron, and causes the other end of the neuron to release
        special molecules to the next neuron. The cycle continues.
      </blockquote>
      <p>
        That wasn't so bad. If you aren't a neuron expert, you basically are
        now. The fancy term for all of this is action potential. Those neuron
        ends? Synapses. The length? An axon.
      </p>
      <p>
        I'll admit, I left out a bit of information. There's actually atoms
        flowing the other way. I didn't talk about how all of this is reset. But
        that comes after you explain the basics.
      </p>
      <p>Let me write out a bad explanation.</p>
      <blockquote className="p-4 bg-mgaa italic">
        Along a neuron axon, ATP-consuming antiporters pump Na<sup>+</sup> out
        and K<sup>+</sup> in. Neurotransmitters bind to and open Na<sup>+</sup>{" "}
        gates on the phospholipid membrane, triggering a electrochemical
        potential drop. This causes nearby Na<sup>+</sup> voltage-gated channels
        to also open. An action potential travels past the soma down the axon,
        causing neutransmitter vesicles to be fused into the cell membrane,
        triggering downstream excitatory signals.
      </blockquote>
      <p>
        That's not that good. I mean, it's correct. But not good. Show this to
        your grandma or your toddler sibling. I doubt they will understand.
      </p>
      <p>No one explains right.</p>
      <p>...</p>
      <p>
        Okay, maybe that's a bit harsh. Most explanations get the job done. Most
        teachers, most professors, most graduate students can get the idea
        across. <i>Eventually</i> the students understand. Keyword:{" "}
        <i>eventually</i>.
      </p>
      <h2 className="text-fg1 text-lg font-bold italic text-right">
        Why do explanations matter if what we have works?
      </h2>
      <p>
        Imagine a world where anyone can learn anything in a day. Honestly,
        that's probably not going to happen no matter how hard we try. But we
        can still try and get close.
      </p>
      <p>
        Democratization of knowledge. It's cool to know things. It's cool to
        learn things. You may not find it useful. But you might find yourself
        using it. Awareness is power. If you don't work in the field, now you
        can talk to someone who does. And if you do work in the field, training
        apprentices becomes easier. You gain the power to talk in any
        conversation because you already understand.
      </p>
      <h2 className="text-fg1 text-lg font-bold italic text-right">
        So how do you explain things better?
      </h2>
      <p>Let's start easier. Level 1. Setting the stage.</p>
      <blockquote className="p-4 bg-mgaa italic">
        You got these little cells called neurons. They're really long. All
        along their surface...
      </blockquote>
      <p>
        Your audience won't ever understand what you're doing if they can't
        visualize it.
      </p>
      <p>
        The most important part is <i>where</i>. If your audience doesn't know
        the scene, they can't place characters in them, move them around, and
        build a narrative.
      </p>
      <p>
        For the neuron, I start with describing the shape of a neuron. I then
        describe it's surface as having pumps on it. Before jumping into the
        action, maybe, y'know, set the stage a bit. Don't toss your audience
        into the bucket. At least lower them gently onto a cushion.
      </p>
      <p>That's not too hard. Level 2. Anthropomorphism.</p>
      <blockquote className="p-4 bg-mgaa italic">
        ...Those atoms want to get back in. It's too stuffy outside. But they
        can't...
      </blockquote>
      <p>
        That's a big word. It means "to give human traits." I'm going to make a
        lot of scientists mad with this take, but anthropomorphism is your best
        shot at getting ideas through. It's not accurate. It's not what's{" "}
        <i>really</i> happening. I concede. Yes. It's also a <i>crucial</i>, if
        not the <i>only</i> way we as humans understand the world.
      </p>
      <p>
        I use it here to describe what the atoms are doing. Atoms cannot "want."
        Atoms don't feel "stuffy." But that's just how diffusion works. I could
        use all the fancy terms I want, and this dumb explanation still gets the
        point across.
      </p>
      <p>Great. Next one. Level 3. Chosing your words.</p>
      <blockquote className="p-4 bg-mgaa italic">
        ...But then, a special molecule comes by and sticks to those gates,
        prying them open...
      </blockquote>
      <p>
        This one is quite a simple one, really. Don't use big words. You want to
        sound smart. You want to sound knowledgeable. So you use big, fancy
        terminology that is overly specific and technically correct, but only
        confuses the reader. Don't. Cut to the chase.
      </p>
      <p>Here's some words that I switched out:</p>
      <ul className="list-disc list-inside pl-6">
        <li>ATP-consuming antiport → pump</li>
        <li>
          Na<sup>+</sup> → atom
        </li>
        <li>channel → gate</li>
        <li>neurotransmitter → special molecule</li>
        <li>electrochemical potential drop → flooding</li>
        <li>action potential → chain reaction</li>
        <li>downstream excitatory signals → the cycle continues</li>
      </ul>
      <p>
        The audience doesn't have time to search up each term you mention. Just
        be blunt, direct, and frankly stupid. I call this "caveman speak." Just
        describe things for what they are, not the term the scientific community
        agreed on and is probably named after some random guy.
      </p>
      <h2 className="text-fg1 text-lg font-bold italic text-right">
        Is that it?
      </h2>
      <p>
        Almost. There is one more trick that I can't quite fit into this
        example. But it is your holy grail of explanations.
      </p>
      <p>Metaphors.</p>
      <p>
        Let me use it in an example where it works best. I recently explained
        the basics of biology to someone like so:
      </p>
      <blockquote className="p-4 bg-mgaa italic">
        We're all just big blobs of foam with tons of chemical reactions.
      </blockquote>
      <p>
        And well, its not wrong. We are just extremely dense foam. Cells. Each
        one containing its own chemical reactions going about their day. In
        fact, soap bubbles are kind of like our cells. The structure of a soap
        bubble's surface is a sandwich of lipids/fats with water filling. That's
        basically a cell.
      </p>
      <p>Below are some of metaphors I've used recently</p>
      <blockquote className="p-4 bg-mgaa italic">
        The cornea is a mountain.
        <br />
        Duvets are dumplings.
        <br />
        Caterpillars are noodles.
        <br />
        Death is returning to chemistry.
        <br />
        That bed's a table.
        <br />
        That's a living pompom.
      </blockquote>
      <p>
        Us humans are very good at comparing things. Metaphors are just that.
        It's hard to learn new things. But if you have something new that
        behaves the same way as something old, learning becomes easier.
      </p>
      <h2 className="text-fg1 text-lg font-bold italic text-right">
        Okay, now, is that it?
      </h2>
      <p>
        There's probably more. Little strategies. Tiny tricks to explain tough
        topics. But in general, these big categories are good enough.
      </p>
      <ul className="list-disc list-inside pl-6">
        <li>Setting the Stage</li>
        <li>Anthropomorphism</li>
        <li>Choosing Words</li>
        <li>Metaphors</li>
      </ul>
      <p>Now go forth and explain! Be the educators you always wanted to be!</p>
    </Post>
  );
}

const OnWriting: FullPost = {
  name: "on-writing",
  title: "On Writing",
  date: [2026, 10, 8],
  post: ThePost,
};

export default OnWriting;
