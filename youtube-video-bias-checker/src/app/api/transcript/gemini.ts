"use server";

import {
  GoogleGenAI,
  GenerateContentResponse,
  Content,
  Tool,
} from "@google/genai";
import politicalAnalysisSchema from "./response_schema";

// NOTE: Your API key should be securely managed,
// potentially via environment variables.
// For this example, it's assumed to be set up in the environment.
const ai = new GoogleGenAI({
  apiKey: process.env.GEN_AI_API_KEY,
});
const model = "gemini-2.5-pro";
const systemInstruction =
  "You are a neutral, objective political analyst. Your sole task is to analyze the provided transcript for political bias and underlying ideology.";

const analysisTool: Tool = {
  functionDeclarations: [
    {
      name: "record_political_analysis",
      description: "Records the political bias analysis of a given transcript.",
      parameters: politicalAnalysisSchema,
    },
  ],
};

const modelConfig = {
  model: model,
  systemInstruction: systemInstruction,
  tools: [analysisTool],
};

export async function analyzeTranscript(transcript: string = testTranscript) {
  try {
    // Get the response

    const prompt: string = `Please analyze the following transcript and report your findings using the 'record_political_analysis' tool.

    Transcript:
    ---
    ${transcript}
    ---
    `;

    // You can also type the contents array if it's more complex
    const contents: Content[] = [{ parts: [{ text: prompt }] }];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: modelConfig,
    });

    // Accessing the text response
    // Note: It's good practice to check if the response and text exist
    // TODO, have one return so easier to read
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0]; // Assuming one function call
      console.log(`Function to call: ${functionCall.name}`);
      console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
      return functionCall.args;
      // In a real app, you would call your actual function here:
      // const result = await scheduleMeeting(functionCall.args);
    } else {
      console.log("No function call found in the response.");
      console.log(response.text);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Call the main function

const testTranscript: string = `[Music]
At some point around the 60s, we stopped
thinking like people and we started
thinking like
Yeah.
Okay. So, this isn't the whole point of
the video, but I do want to show you a
quick graph. It's the use of the
sentence marketplace of ideas over time.
You can see that around the mid60s that
sentence just took off. And this makes
sense, right? I looked it up on the most
authoritative platform I know,
Wikipedia. And the first use of free
trade in ideas was only in 1919. The
first verbatim marketplace of ideas was
34 years later. And it's only a decade
after that that it became official
policy in Brandenburgg v. Ohio in 1969.
That timeline is obviously a big reason
for the boom happening when it did. But
there's something more to this story.
I'm not showing you this graph so I can
talk about the metaphor itself. It's not
a fantastic metaphor for a ton of
reasons which I think are pretty
obvious. The myth of the marketplace of
ideas that truth somehow always wins
when every single opinion, no matter how
horrible, is put out there is just
obviously not true. Ideas don't really
compete in a competitive or level
playing field. People don't really
assess ideas like their products. The
idea that truth always comes out on top
is laughable.
And just in general, you probably
already know that the people who use
this sentence pull it out almost
exclusively to say bigoted stuff, right?
Lots of problems there. Whatever. It is
interesting that this metaphor has
become so widespread despite its
problems. But what I find more
interesting about this graph is that
it's getting at something deeper. The
total takeover of economicish language
and ideas about how we make decisions.
Something that started in the '60s, but
then quickly snowballed to where we are
today. It's clearly become very
fashionable to think like an economist
over the last half century. Without
looking too hard, you can find people
talking about things like supply and
demand and game theory. game theory
>> on just about any topic from politics
and public policy all the way down to
frankly quite creepy stuff about like
the dating market. That's interesting
and it's weird. Why did thinking like an
economist take off but thinking like an
anthropologist, for example, never did?
We'll get to why, but first it's pretty
clear that this trend has made life
worse for most of us. Because if it
wasn't obvious from the last hundred
videos, already neoliberal economists
tend to be
[Music]
But first, it's ad read time because
I've got to pay my bills. Let me show
you something real quick. Google your
name. I know you have to open another
tab or switch apps. Just do it real
quick. Odds are some of your personal
information comes up, right? If I search
my name, it's just my public social
media accounts. Want to know why?
Because I use Aura, the sponsor of
today's video. If you've ever wondered
why you're constantly harassed by spam
calls, texts, and emails, here's why.
There are companies called data brokers
whose sole purpose is to find and sell
your data. They do it without your
consent, and they make billions selling
it to marketers, scammers, and even
stalkers. And while they're legally
required to remove your info if you ask,
they make the process confusing and
difficult on purpose. This is why I'm
always recommending Aura to family and
friends. They take care of everything
for you. They remove your data from
these sites and they keep it removed.
Aura is an all-in-one digital security
tool. You may already use some other
basic app, but not using Aura is like
locking your front door, but leaving
your back door wide open. And Aura
doesn't just fight data brokers. They
alert you if your personal data is found
on the dark web. They provide real-time
fraud alerts for credit and banking,
24/7 identity theft monitoring, a secure
VPN, anti virus, parental controls,
password manager, credit checker, and
more. And if somehow anything does
happen, Aura includes $5 million in
identity theft insurance, and they have
US-based fraud experts on call 24/7. If
you're anything like me, I'm sure you're
sick and tired of these stupid, evil
little companies stealing your personal
information and using it to make a quick
buck. That's why I use Aura. It keeps me
and my family safe online. If you're
ready to protect your data, you can get
2 weeks absolutely free when you use my
link. During those two weeks, you'll see
exactly where your data is being leaked
and who's doing it. Give it a try. I
promise you'll appreciate the peace of
mind. Now, back to the show.
You've heard of the prisoner's dilemma
before. If not, just picture this. You
are one of two prisoners kept in a jail
in separate cells. The warden gives you
a choice. Confess to your crime and rat
out your partner or stay silent. If you
confess and your partner doesn't, you
walk out scot-free. If you both confess,
you both serve 5 years. If neither of
you confesses, you both only get one
year. But if he confesses and you don't,
you'll be the one spending 10 years in
jail while he gets to go free, what
should you do? For the mathematicians at
the Rand Corporation who created this
thought experiment in the ' 50s, the
rational answer for this standard
oneshot of the prisoner's dilemma is to
rat out the other guy no matter what.
Assume selfishness and be selfish
yourself. After all, in most scenarios,
ratting the other out will make you
better off. And odds are the other guy
is thinking the same thing because the
same is true for him. If you want, you
can do some math using the numbers I
gave you earlier and put them into a
table like this to calculate exactly
what the expected number of years in
jail is for every action. The Nash
equilibrium, which is usually considered
the quote unquote optimal solution for
this setup, is to confess. Even though
the best collective outcome is for both
people to stay silent, each person's
best choice is to confess.
Now, there have been a ton of variations
on the prisoner's dilemma. A set number
of rounds versus an infinite number.
Different payouts for confessing or
being quiet. Swapping freedom and jail
time for prize money or torture.
Different numbers of players. Different
options than just the standard two.
People have messed with it quite a bit.
And all these variations can give you
different optimal strategies and
results.
Tonight, you're all going to be a part
of a social experiment. Each of you has
a remote. Blow off the other boat. If,
however, one of you presses the button,
I'll let that boat live. So, who's it
going to be? But at its inception,
the game was meant to reveal something
basic and fundamental about humans and
how we make decisions. In all of its
many iterations, the prisoner's dilemma
states that if we just act selfishly
about what our expected gains are, we
are mathematically
rational. It doesn't say you can't
cooperate, but it always considers the
value of cooperation from the point of
view of maximizing the individual's own
personal gain. The game always measures
what you are doing as rational by
whether or not your expectations of
reward are as high as possible. Even in
versions of the game where the quote
unquote mathematically optimal strategy
is to prefer cooperation.
The thing is that this isn't actually
telling us anything about our
decision-making process. In real world
experiments of the game, people chose
the unoptimal strategy all the time,
which economists can't explain, so they
just call people idiots. But that's
because this rationality the game
theorists came up with isn't reality.
It's a normative claim on what our
decision-making process should be. And
you can probably already see why there
might be some problems with basing
rationality on something like the
prisoners dilemma. For one, this game is
not meant to have you ask questions
like, "What if I care about more than
the number of years I'll spend in jail?
What if I care about the other guy or
due process? What if I care about the
feeling of betrayal? What commitments do
this other person and I have to each
other? What if there are social
conventions in place that change our
expectations about what the other
person's going to do? Or at a very basic
level, what if we could just talk? Those
questions are designed to be outside the
game. Plenty of real world evidence
shows that people think about stuff like
that in situations like the prisoners
dilemma, and that different cultures
have different approaches to life than
just trying to maximize their own
personal gain. But on paper, the name of
the game is how do you get the fewest
years in jail possible and nothing else.
And that would be fine if the prisoner's
dilemma was just a mathematical
experiment.
But it's not.
>> And here we go. Like the marketplace of
ideas, The Prisoner's Dilemma and the
rest of the field of game theory that
it's inspired is one of those things
that became wildly popular during the
mid 20th century. Especially
[Music]
in economics where most of
microeconomics actually changed how it
understands value to be similar to the
approach used in the prisoners dilemma.
Something called expected utility
theory. Essentially, because of game
theory, economists now assume that
people make decisions based on their
expectations of getting the best
possible outcome for themselves. That
wasn't always the case. And since value
is probably the most foundational thing
in economics, changing that means
changing almost everything at once. And
it's not just econ.
Game theory and exercises like the
prisoners dilemma are taught in math
departments, political science,
sociology, psychology, and environmental
studies. Philosophy departments offer
courses in logic that heavily rely on
game theory. It's been used to study
animal behavior and even bacterial
organisms. It has even become the
metaphor for why countries don't act on
climate change after the Stern Review
came out in 2006. Formulas developed by
game theorists now inform many of our
big political decisions. This has had a
profound effect. It's reframed
rationality to something very specific,
expected individual gain. Despite the
fact that the prisoners dilemma can be
challenged on empirical and theoretical
grounds for not including enough for
making wild assumptions about how humans
think or the fact that rational choice
theory is also essentially taught to
logical. It defines rationality as
people choosing based on their
preferences. So by definition every
decision that actually occurs is
rational. Brilliant work. Really truly
amazing stuff. And yet it still took
over all these disciplines and aspects
of our lives. So now when we think about
politics and elections, it's through
this specific framing of rationality.
And who can blame us? A ton of work is
done by pollsters and data scientists
and media strategists to find the way to
sell a candidate to the public so that
the greatest number of people feel like
they're maximizing their utility by
voting for one guy over another. and to
maximize mutual distrust and increase
the stakes of rejecting a cooperative
alternative. In public policy too, we
now analyze political motives and
policies not through what is the best
collective social outcome and process,
democratic debate, and the respect of
all people's personhood, but instead
through the best possible way to create
the conditions in which any one person
could technically maximize their own
selfish ends, regardless of what that
means for others. We put ourselves in
the shoes of the guy just trying to look
out for himself. Others are no longer
entitled to respect, safety, or other
considerations that escape the narrow
border drawn around me and my family.
All they're entitled to is the right to
defend themselves from our selfishness,
too. As if there was no society, just
people duking it out. The problem is
that this objectively sucks. And the
real world isn't like that. This hyper
individualism is a race to the bottom
because it makes the very idea of the
common good seem like an irrational
choice. Those who developed game theory
and its policy offshoot, public choice
theory, these guys even went so far as
to argue that the mathematical methods
could be used to prove that there's no
such thing as the common good in the
first place. They transformed the way we
think about politics as if it's a
marketplace in which we are completely
selfish individuals entering to maximize
only our own gain when we vote for
someone or greenlight a policy.
And because they were staunch defenders
of American capitalism during the Cold
War, they made it their mission to
develop this so it would make complete
violent selfishness synonymous with
reason. They based their ideas of
justice not on the agreements people
make in a democratic process, a method
far too irrational and unmathematic. And
instead, justice became redefined as how
do we get the biggest expected utility
possible. And since we can never
actually measure utility directly, the
only thing left to judge policy on was
if it gave someone the possibility of
becoming an uber billionaire, regardless
of how many lives we ruin or acres of
rainforest we burn to get there. the
expected value of the ends justify the
means. This is how we were left with
neoliberalism with gutting public
housing, education, child care, and
healthcare so that middlemen could get
richer siphoning off more of our money
when things go private. Wealth
redistribution from the top was out of
the question since, oh, just look at the
table. The oho important incentives
would just never be as good for our
great selfish billionaires.
But it is so obvious that making the
world a place where everyone is in the
same race to become a billionaire, where
collective distrust and maximizing
individual returns with no concern for
how many people need to be stomped on to
do so means destroying everything.
Destroying the possibility that everyone
can thrive. We don't all need to have
the hope of becoming billionaires to be
happy. But we live in a world of
billionaires getting out of jail free
while everyone else is slowly chiseling
away at their 10 years. This is what
neoliberalism was built on, on formulas
that claim they can prove what we ought
to do, sneaking past us the assumption
that our only goal should be coming out
on top. But people don't actually think
the way these models say they do. People
in the real world often make decisions
collaboratively, selflessly, with
different goals in mind, acting
inconsistently, and with more than one
preference, caring about process and not
just outcomes, and certainly not just
themselves. This isn't irrational. It
isn't inefficient. It is capital G good.
It is what keeps us in community.
Nothing is ever like the models. So why
try to build a society where even the
models suck?
[Music]`;
