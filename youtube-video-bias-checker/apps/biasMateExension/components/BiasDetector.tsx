"use client";

import { useState } from "react";
import {
  fetchTranscript,
  extractVideoID,
  analyzeTranscript,
} from "../utils/analyzeTranscript";
import Markdown from "react-markdown";
import AnalysisActions from "./AnalysisActions";
import BiasResultPanel from "./BiasResultPanel";
import { getTranscript, TranscriptItem } from "../utils/transcript";
import { extractVideoMetadata, VideoMetadata } from "../utils/videoMetadata";
import { useAuth } from "../lib/useAuth";

export default function BiasDetector() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  const handleSubmit = async () => {
    // Check authentication before proceeding
    // if (!isAuthenticated) {
    //   alert("Please log in via the extension popup (click the Bias Mate icon) to analyze videos.");
    //   return;
    // }

    setIsLoading(true);
    try {
      const videoMetadata: VideoMetadata | null = extractVideoMetadata();
      if (!videoMetadata) {
        alert("Please enter a valid YouTube URL.");
        return;
      }
      // TODO: Uncomment, to stop IP Block, use hard coded transcript
      // const transcript: TranscriptItem[] | null = await getTranscript(
      //   videoMetadata.videoId
      // );
      // if (!transcript) {
      //   alert("No transcript available for this video.");
      //   setIsLoading(false);
      //   return;
      // }
      console.log("Transcript:", transcript);
      // TODO: Enable After, to Prevent API Usage For Gemini
      // const analysisResult = await analyzeTranscript(transcript.toString());
      // const analysisResult = await analyzeTranscript(transcript);
      const analysisResult = {
      "political_philosophies": [
        "Anti-Neoliberalism",
        "Progressivism",
        "Collectivism",
        "Social Democracy"
      ],
      "political_leaning": "left",
      "summary_and_analysis": "The transcript presents a staunchly left-wing critique of modern economic rationality and neoliberalism. The speaker identifies the 1960s as a turning point where 'thinking like an economist'—specifically the adoption of game theory and 'expected utility theory'—began to dominate public policy and social thought.\n\n**Loaded Language:** The speaker uses highly emotive and disparaging language to characterize opposing viewpoints. The 'marketplace of ideas' is dismissed as a 'myth' used 'almost exclusively to say bigoted stuff.' Economic models are described as 'creepy,' 'laughable,' and things that 'objectively suck.' The speaker refers to 'great selfish billionaires' and the 'gutting' of public services so 'middlemen could get richer.'\n\n**Framing:** The video is framed as an exposé of how mathematical models like the 'Prisoner's Dilemma' have 'made life worse for most of us' by enshrining 'violent selfishness' as the only rational behavior. It positions neoliberalism not as a neutral economic theory but as a destructive ideology that justifies inequality and the destruction of the 'common good.'\n\n**Sourcing Balance:** The transcript is a one-sided monologue. While it references specific academic concepts (Nash equilibrium, public choice theory, expected utility theory), it does so only to critique them. There is no representation of the arguments in favor of these models, nor is there a balanced exploration of why they were adopted beyond the claim that they were 'staunch defenders of American capitalism during the Cold War.'\n\n**Underlying Ideology:** The speaker advocates for a collectivist worldview, emphasizing 'community,' 'democratic process,' and the 'common good' over 'hyper-individualism.' The critique of wealth redistribution 'from the top' and the focus on public housing, education, and healthcare align with Social Democratic or Progressive political philosophies. The speaker concludes by framing collaborative and selfless action as 'capital G good,' directly moralizing the rejection of market-based individual rationality."
    }
    
      console.log("Analysis Result:", analysisResult);

      const text =
        typeof analysisResult === "string"
          ? analysisResult
          : JSON.stringify(analysisResult, null, 2);

      setMarkdown(text || "Failed to get analysis.");

      if (typeof analysisResult !== "string") {
        setAnalysis(analysisResult);
        setIsSubmitted(true);
      } else {
        console.warn(
          "Analysis returned string, expected object:",
          analysisResult
        );
        alert("Analysis did not return structured data. Please try again.");
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      setMarkdown("Error occurred during analysis.");
      alert("An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show auth status in header
  const authStatusText = authLoading 
    ? "Checking login..." 
    : isAuthenticated 
      ? `Logged in as ${user?.email}` 
      : "Not logged in - click extension icon to sign in";

  if (isSubmitted && analysis) {
    return (
      <BiasResultPanel
        analysis={analysis}
        isLoading={isLoading}
        onReanalyze={handleSubmit}
      />
    );
  }

  return (
    <div className="w-full bg-bg-light p-5 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-2xl border border-border-muted flex flex-col h-auto animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-5">
        <h3 className="text-text-primary text-xl font-bold leading-tight">
          BiasMate
        </h3>
        <p className="text-text-secondary text-sm font-normal">
          Check this video's political leanings and framing
        </p>
        <p className="text-text-muted text-xs font-normal mt-1">
          {authStatusText}
        </p>
      </div>
      {/* Actions */}
      <AnalysisActions
        isLoading={isLoading || authLoading}
        onAnalyze={handleSubmit}
        loadingText={authLoading ? "Checking auth..." : "Analyzing..."}
        buttonText={isAuthenticated ? "Analyze" : "Sign in to Analyze"}
      />
    </div>
  );
}

let transcript = `0:00
[Music]
0:05
At some point around the 60s, we stopped
0:08
thinking like people and we started
0:09
thinking like
0:12
Yeah.
0:16
Okay. So, this isn't the whole point of
0:18
the video, but I do want to show you a
0:20
quick graph. It's the use of the
0:22
sentence marketplace of ideas over time.
0:25
You can see that around the mid60s that
0:27
sentence just took off. And this makes
0:30
sense, right? I looked it up on the most
0:32
authoritative platform I know,
0:33
Wikipedia. And the first use of free
0:36
trade in ideas was only in 1919. The
0:39
first verbatim marketplace of ideas was
0:41
34 years later. And it's only a decade
0:44
after that that it became official
0:46
policy in Brandenburgg v. Ohio in 1969.
0:50
That timeline is obviously a big reason
0:53
for the boom happening when it did. But
0:56
there's something more to this story.
0:58
I'm not showing you this graph so I can
1:00
talk about the metaphor itself. It's not
1:02
a fantastic metaphor for a ton of
1:04
reasons which I think are pretty
1:06
obvious. The myth of the marketplace of
1:09
ideas that truth somehow always wins
1:11
when every single opinion, no matter how
1:14
horrible, is put out there is just
1:16
obviously not true. Ideas don't really
1:18
compete in a competitive or level
1:20
playing field. People don't really
1:22
assess ideas like their products. The
1:24
idea that truth always comes out on top
1:25
is laughable.
1:28
And just in general, you probably
1:30
already know that the people who use
1:31
this sentence pull it out almost
1:33
exclusively to say bigoted stuff, right?
1:36
Lots of problems there. Whatever. It is
1:38
interesting that this metaphor has
1:39
become so widespread despite its
1:42
problems. But what I find more
1:44
interesting about this graph is that
1:46
it's getting at something deeper. The
1:49
total takeover of economicish language
1:53
and ideas about how we make decisions.
1:56
Something that started in the '60s, but
1:58
then quickly snowballed to where we are
1:59
today. It's clearly become very
2:02
fashionable to think like an economist
2:04
over the last half century. Without
2:06
looking too hard, you can find people
2:08
talking about things like supply and
2:10
demand and game theory. game theory
2:13
on just about any topic from politics
2:15
and public policy all the way down to
2:18
frankly quite creepy stuff about like
2:20
the dating market. That's interesting
2:23
and it's weird. Why did thinking like an
2:26
economist take off but thinking like an
2:29
anthropologist, for example, never did?
2:32
We'll get to why, but first it's pretty
2:34
clear that this trend has made life
2:36
worse for most of us. Because if it
2:39
wasn't obvious from the last hundred
2:40
videos, already neoliberal economists
2:44
tend to be
2:51
[Music]
2:56
But first, it's ad read time because
2:58
I've got to pay my bills. Let me show
3:00
you something real quick. Google your
3:02
name. I know you have to open another
3:03
tab or switch apps. Just do it real
3:05
quick. Odds are some of your personal
3:07
information comes up, right? If I search
3:10
my name, it's just my public social
3:12
media accounts. Want to know why?
3:14
Because I use Aura, the sponsor of
3:16
today's video. If you've ever wondered
3:18
why you're constantly harassed by spam
3:20
calls, texts, and emails, here's why.
3:22
There are companies called data brokers
3:24
whose sole purpose is to find and sell
3:27
your data. They do it without your
3:29
consent, and they make billions selling
3:30
it to marketers, scammers, and even
3:32
stalkers. And while they're legally
3:35
required to remove your info if you ask,
3:37
they make the process confusing and
3:39
difficult on purpose. This is why I'm
3:42
always recommending Aura to family and
3:44
friends. They take care of everything
3:46
for you. They remove your data from
3:47
these sites and they keep it removed.
3:50
Aura is an all-in-one digital security
3:52
tool. You may already use some other
3:54
basic app, but not using Aura is like
3:56
locking your front door, but leaving
3:57
your back door wide open. And Aura
4:00
doesn't just fight data brokers. They
4:02
alert you if your personal data is found
4:03
on the dark web. They provide real-time
4:05
fraud alerts for credit and banking,
4:07
24/7 identity theft monitoring, a secure
4:09
VPN, anti virus, parental controls,
4:12
password manager, credit checker, and
4:14
more. And if somehow anything does
4:16
happen, Aura includes $5 million in
4:19
identity theft insurance, and they have
4:20
US-based fraud experts on call 24/7. If
4:23
you're anything like me, I'm sure you're
4:25
sick and tired of these stupid, evil
4:27
little companies stealing your personal
4:29
information and using it to make a quick
4:30
buck. That's why I use Aura. It keeps me
4:33
and my family safe online. If you're
4:35
ready to protect your data, you can get
4:37
2 weeks absolutely free when you use my
4:39
link. During those two weeks, you'll see
4:41
exactly where your data is being leaked
4:42
and who's doing it. Give it a try. I
4:45
promise you'll appreciate the peace of
4:46
mind. Now, back to the show.
4:51
You've heard of the prisoner's dilemma
4:52
before. If not, just picture this. You
4:55
are one of two prisoners kept in a jail
4:57
in separate cells. The warden gives you
5:00
a choice. Confess to your crime and rat
5:02
out your partner or stay silent. If you
5:04
confess and your partner doesn't, you
5:06
walk out scot-free. If you both confess,
5:09
you both serve 5 years. If neither of
5:11
you confesses, you both only get one
5:13
year. But if he confesses and you don't,
5:17
you'll be the one spending 10 years in
5:19
jail while he gets to go free, what
5:21
should you do? For the mathematicians at
5:24
the Rand Corporation who created this
5:25
thought experiment in the ' 50s, the
5:27
rational answer for this standard
5:29
oneshot of the prisoner's dilemma is to
5:31
rat out the other guy no matter what.
5:33
Assume selfishness and be selfish
5:35
yourself. After all, in most scenarios,
5:37
ratting the other out will make you
5:39
better off. And odds are the other guy
5:42
is thinking the same thing because the
5:44
same is true for him. If you want, you
5:46
can do some math using the numbers I
5:48
gave you earlier and put them into a
5:49
table like this to calculate exactly
5:51
what the expected number of years in
5:52
jail is for every action. The Nash
5:55
equilibrium, which is usually considered
5:57
the quote unquote optimal solution for
5:59
this setup, is to confess. Even though
6:02
the best collective outcome is for both
6:04
people to stay silent, each person's
6:06
best choice is to confess.
6:09
Now, there have been a ton of variations
6:11
on the prisoner's dilemma. A set number
6:13
of rounds versus an infinite number.
6:15
Different payouts for confessing or
6:16
being quiet. Swapping freedom and jail
6:19
time for prize money or torture.
6:21
Different numbers of players. Different
6:22
options than just the standard two.
6:24
People have messed with it quite a bit.
6:26
And all these variations can give you
6:28
different optimal strategies and
6:30
results.
6:33
Tonight, you're all going to be a part
6:34
of a social experiment. Each of you has
6:37
a remote. Blow off the other boat. If,
6:41
however, one of you presses the button,
6:43
I'll let that boat live. So, who's it
6:47
going to be? But at its inception,
6:52
the game was meant to reveal something
6:54
basic and fundamental about humans and
6:57
how we make decisions. In all of its
6:59
many iterations, the prisoner's dilemma
7:01
states that if we just act selfishly
7:03
about what our expected gains are, we
7:05
are mathematically
7:07
rational. It doesn't say you can't
7:09
cooperate, but it always considers the
7:12
value of cooperation from the point of
7:14
view of maximizing the individual's own
7:16
personal gain. The game always measures
7:20
what you are doing as rational by
7:22
whether or not your expectations of
7:23
reward are as high as possible. Even in
7:26
versions of the game where the quote
7:27
unquote mathematically optimal strategy
7:30
is to prefer cooperation.
7:33
The thing is that this isn't actually
7:36
telling us anything about our
7:37
decision-making process. In real world
7:40
experiments of the game, people chose
7:41
the unoptimal strategy all the time,
7:44
which economists can't explain, so they
7:46
just call people idiots. But that's
7:48
because this rationality the game
7:49
theorists came up with isn't reality.
7:52
It's a normative claim on what our
7:54
decision-making process should be. And
7:56
you can probably already see why there
7:58
might be some problems with basing
8:00
rationality on something like the
8:02
prisoners dilemma. For one, this game is
8:05
not meant to have you ask questions
8:07
like, "What if I care about more than
8:09
the number of years I'll spend in jail?
8:11
What if I care about the other guy or
8:12
due process? What if I care about the
8:14
feeling of betrayal? What commitments do
8:16
this other person and I have to each
8:17
other? What if there are social
8:19
conventions in place that change our
8:20
expectations about what the other
8:22
person's going to do? Or at a very basic
8:25
level, what if we could just talk? Those
8:28
questions are designed to be outside the
8:31
game. Plenty of real world evidence
8:33
shows that people think about stuff like
8:34
that in situations like the prisoners
8:36
dilemma, and that different cultures
8:38
have different approaches to life than
8:39
just trying to maximize their own
8:41
personal gain. But on paper, the name of
8:44
the game is how do you get the fewest
8:47
years in jail possible and nothing else.
8:50
And that would be fine if the prisoner's
8:52
dilemma was just a mathematical
8:54
experiment.
8:55
But it's not.
8:57
And here we go. Like the marketplace of
9:02
ideas, The Prisoner's Dilemma and the
9:04
rest of the field of game theory that
9:05
it's inspired is one of those things
9:07
that became wildly popular during the
9:09
mid 20th century. Especially
9:14
[Music]
9:18
in economics where most of
9:20
microeconomics actually changed how it
9:22
understands value to be similar to the
9:24
approach used in the prisoners dilemma.
9:26
Something called expected utility
9:29
theory. Essentially, because of game
9:31
theory, economists now assume that
9:33
people make decisions based on their
9:35
expectations of getting the best
9:36
possible outcome for themselves. That
9:39
wasn't always the case. And since value
9:42
is probably the most foundational thing
9:44
in economics, changing that means
9:46
changing almost everything at once. And
9:49
it's not just econ.
9:52
Game theory and exercises like the
9:54
prisoners dilemma are taught in math
9:56
departments, political science,
9:57
sociology, psychology, and environmental
10:00
studies. Philosophy departments offer
10:01
courses in logic that heavily rely on
10:04
game theory. It's been used to study
10:06
animal behavior and even bacterial
10:08
organisms. It has even become the
10:10
metaphor for why countries don't act on
10:12
climate change after the Stern Review
10:14
came out in 2006. Formulas developed by
10:17
game theorists now inform many of our
10:20
big political decisions. This has had a
10:23
profound effect. It's reframed
10:26
rationality to something very specific,
10:30
expected individual gain. Despite the
10:33
fact that the prisoners dilemma can be
10:35
challenged on empirical and theoretical
10:37
grounds for not including enough for
10:39
making wild assumptions about how humans
10:40
think or the fact that rational choice
10:42
theory is also essentially taught to
10:44
logical. It defines rationality as
10:47
people choosing based on their
10:49
preferences. So by definition every
10:52
decision that actually occurs is
10:54
rational. Brilliant work. Really truly
10:56
amazing stuff. And yet it still took
10:59
over all these disciplines and aspects
11:01
of our lives. So now when we think about
11:04
politics and elections, it's through
11:07
this specific framing of rationality.
11:10
And who can blame us? A ton of work is
11:13
done by pollsters and data scientists
11:15
and media strategists to find the way to
11:17
sell a candidate to the public so that
11:19
the greatest number of people feel like
11:21
they're maximizing their utility by
11:23
voting for one guy over another. and to
11:25
maximize mutual distrust and increase
11:27
the stakes of rejecting a cooperative
11:29
alternative. In public policy too, we
11:33
now analyze political motives and
11:34
policies not through what is the best
11:36
collective social outcome and process,
11:38
democratic debate, and the respect of
11:40
all people's personhood, but instead
11:42
through the best possible way to create
11:44
the conditions in which any one person
11:46
could technically maximize their own
11:48
selfish ends, regardless of what that
11:50
means for others. We put ourselves in
11:53
the shoes of the guy just trying to look
11:54
out for himself. Others are no longer
11:57
entitled to respect, safety, or other
11:59
considerations that escape the narrow
12:00
border drawn around me and my family.
12:03
All they're entitled to is the right to
12:05
defend themselves from our selfishness,
12:07
too. As if there was no society, just
12:10
people duking it out. The problem is
12:12
that this objectively sucks. And the
12:15
real world isn't like that. This hyper
12:18
individualism is a race to the bottom
12:21
because it makes the very idea of the
12:22
common good seem like an irrational
12:25
choice. Those who developed game theory
12:28
and its policy offshoot, public choice
12:30
theory, these guys even went so far as
12:32
to argue that the mathematical methods
12:34
could be used to prove that there's no
12:36
such thing as the common good in the
12:39
first place. They transformed the way we
12:41
think about politics as if it's a
12:43
marketplace in which we are completely
12:44
selfish individuals entering to maximize
12:47
only our own gain when we vote for
12:49
someone or greenlight a policy.
12:54
And because they were staunch defenders
12:56
of American capitalism during the Cold
12:57
War, they made it their mission to
12:59
develop this so it would make complete
13:02
violent selfishness synonymous with
13:04
reason. They based their ideas of
13:06
justice not on the agreements people
13:08
make in a democratic process, a method
13:10
far too irrational and unmathematic. And
13:13
instead, justice became redefined as how
13:16
do we get the biggest expected utility
13:18
possible. And since we can never
13:20
actually measure utility directly, the
13:22
only thing left to judge policy on was
13:24
if it gave someone the possibility of
13:27
becoming an uber billionaire, regardless
13:29
of how many lives we ruin or acres of
13:31
rainforest we burn to get there. the
13:34
expected value of the ends justify the
13:37
means. This is how we were left with
13:40
neoliberalism with gutting public
13:42
housing, education, child care, and
13:44
healthcare so that middlemen could get
13:46
richer siphoning off more of our money
13:48
when things go private. Wealth
13:50
redistribution from the top was out of
13:52
the question since, oh, just look at the
13:54
table. The oho important incentives
13:56
would just never be as good for our
13:58
great selfish billionaires.
14:03
But it is so obvious that making the
14:06
world a place where everyone is in the
14:08
same race to become a billionaire, where
14:10
collective distrust and maximizing
14:12
individual returns with no concern for
14:14
how many people need to be stomped on to
14:16
do so means destroying everything.
14:18
Destroying the possibility that everyone
14:20
can thrive. We don't all need to have
14:23
the hope of becoming billionaires to be
14:25
happy. But we live in a world of
14:27
billionaires getting out of jail free
14:28
while everyone else is slowly chiseling
14:30
away at their 10 years. This is what
14:33
neoliberalism was built on, on formulas
14:36
that claim they can prove what we ought
14:38
to do, sneaking past us the assumption
14:40
that our only goal should be coming out
14:43
on top. But people don't actually think
14:45
the way these models say they do. People
14:47
in the real world often make decisions
14:49
collaboratively, selflessly, with
14:51
different goals in mind, acting
14:53
inconsistently, and with more than one
14:56
preference, caring about process and not
14:58
just outcomes, and certainly not just
15:01
themselves. This isn't irrational. It
15:03
isn't inefficient. It is capital G good.
15:07
It is what keeps us in community.
15:10
Nothing is ever like the models. So why
15:13
try to build a society where even the
15:15
models suck?
15:21
[Music]
`;