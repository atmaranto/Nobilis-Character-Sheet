((window) => {
	let nobilisData = window.nobilisData = {};
	
	nobilisData.domainMiracles = {
		"data": [
			{
				"level": -1,
				"name": "generalRules",
				"label": "General Rules for Domain-Driven Miracles",
				"text": "Some general guidelines for Domain-Drive miracles:<br />" +
						"<ul>" +
							"<li>Lesser miracles can typically create or destroy any of the following:<br />" +
							"<ul>" +
								"<li>Up to 10 tons of material</li>" +
								"<li>One square mile of territory</li>" +
								"<li>One typical instance of the relevant Estate</li>" +
							"</ul></li>" +
							"<li>Lesser miracles are not mundane, but they create relatively mundane things, with limited miraculous properties. Anything on an \"epic\" scale typically requires a major" +
							" miracle.</li>" +
							"<li>A miracle of any level <b>can be combined with other miracles of its level or lower</b>, as long as it remains a single conceptual action.</li>" +
						"</ul>"
			},
			{
				"level": 0,
				"name": "estateDrivenDivinations",
				"label": "Estate-Driven Divinations",
				"text":	"Level-0 miracles, Estate-Driven Divinations, tell you about threat or damage to your Estate. When your Estate is in danger, it will call out to you, and you will feel its pain.<br />" +
						"You can also use these miracles to sense when someone prays to you, if that person knows your symbol or is intimately connected to your Estate. If you choose, you can hear their" +
						" prayer."
			},
			{
				"level": 1,
				"name": "ghostMiracles",
				"label": "Ghost Miracles",
				"text":	"Level-1 miracles summon \"ghosts\" of one's Estate: constructs of the character's mind with a <i>tiny</i> fraction of their Estate's power. Examples include ghostly fires with a" +
						" little bit of heat and ghostly sunlight that can illuinate a book. These miracles, also known as <b>cantrips</b>, are not true illusions. They are partially transparent to the" +
						" Sight, and even a mortal can sometimes tell that they are only seemings. Characters can use them to make their environment a little more comfortable.<br />" +
						"They are also the weapon of choice for formal Noble duels: two Nobles will try to best one another using only ghostly miracles that cause no real harm but that show a shimmaring image" +
						" of what they could accomplish.",
				"examples": [
					"(Music) Make an instrument sound better.",
					"(Forests) Make a \"ghost clearing\" for more comfortable sleep.",
					"(Storms) Make a day seem gloomier.",
					"(Night) Decorate a bedroom with little glowing \"stars\".",
					"(Emotion) Make someone calm sound angry.",
					"(Roads) Make a trail that doesn't go anywhere important.",
					"(Books) Fill a shelf with boring textbooks on nothing of note."
				]
			},
			{
				"level": 2,
				"name": "lesserDivinations",
				"label": "Lesser Divinations",
				"text": "Level-2 miracles give one mundane information about their Estate. A character with the Estate of the sun could predict the sunrise with exact precision, know the dates of all future" +
						" eclipses, and know exactly when the sun will hit a balcony. They could potentially use this information to estimate time accurately, even at night, assuming the sun's path is regular." +
						" One can also perform these miracles within a Chancel, although Powers do much of their investigation on location, by tradition.",
				"examples": [
					"(Music) Know how to play a requested song.",
					"(Forests) Know where a trail ends; know where to find herbs or water.",
					"(Storms) Know when a storm will hit a given city.",
					"(Night) Estimate the time until knihtfall; know somebody's dreams.",
					"(Emotion) Experience true empathy; divine someone's emotional state.",
					"(Roads) Know directions to anywhere.",
					"(Books) Read a closed book."
				]
			},
			{
				"level": 3,
				"name": "lesserPreservations",
				"label": "Lesser Preservations",
				"text": "Level-3 miracles include the simple wards: the moderately-powerful miracles of Preservation. If one had the estate of the Sun, a character could heat the Earth with sunlight or slow" +
						" the path of the sun in the sky. This does not generally cover miracles of epic scope or great drama; this level is for simple applications of the principle of Preservation.",
				"examples": [
					"(Music) Make a song that sticks in the listener's memory.",
					"(Forests) Ward a tree, making it resistant to weapons.",
					"(Storms) Make it rain for days (or, in Seattle, months).",
					"(Night) Keep night animals awake into day; prolong the night.",
					"(Emotion) Make someone stay happy for a long time.",
					"(Roads) Make a road seem longer or take longer to traverse it.",
					"(Books) Make a manuscript that returns to the editor if rejected."
				]
			},
			{
				"level": 4,
				"name": "lesserCreations",
				"label": "Lesser Creations",
				"text": "Level-4 miracles are simple Creation magics, miracles that cause part of one's Estate to come into being. This can be subtler than pulling a fire out of a hat or creating a sunbeam at" +
						" night. Making the sun rise early is a Creation miracle, because it causes day and the sunlight to appear. Note that a Power does not have to create a <i>whole</i> object: they can" +
						" create a fire without heat, a sunbeam without light, or even just one person's memory of a tree where no tree has ever been.",
				"examples": [
					"(Music) Make bewitchingly beautiful music.",
					"(Forests) Grow plants quickly from the naked Earth.",
					"(Storms) Spawn a lightning storm or a drizzle.",
					"(Night) Sink an area into darkness.",
					"(Emotion) Cause someone to feel angry or sad.",
					"(Roads) Create a new road, straight to one's destination.",
					"(Books) Create a how-to book for any domestic task."
				]
			},
			{
				"level": 5,
				"name": "lesserDestructions",
				"label": "Lesser Destructions",
				"text": "Level-5 miracles include lesser Destructions, which remove an aspect of one's Estate from the area or from existence. This is the magic of hurried sunsets and snuffed-out forest" +
						" fires. It can also create <b>\"negative images\"</b> of one's Estate, such as a sunbeam of darkness or a cold fire. In essence, there are three things one can do with a lesser destruction:" +
						" destroy an instance of one's Estate totally, destroy only a part or aspect of an element, and create a negative image with inverted or corrupted aspects of one's Estate.",
				"examples": [
					"(Music) Make silent but affecting music (negative image).",
					"(Forests) Shatter a tree or a few trees (total destruction); make a tree invisible (destroying a part).",
					"(Storms) Clear away rainclouds (total destruction); make a storm's raindrops dry (destroying a part).",
					"(Night) Make the sun rise early (total destruction); make the local night less dark (destroying a part).",
					"(Emotion) Cause someone to stop feeling angry or happy (total destruction).",
					"(Roads) Make someone lost (destroying a part - roads exist to prevent getting lost).",
					"(Books) Make a book incomprehensible, even with the same words (destroying a part)."
				]
			},
			{
				"level": 5,
				"name": "majorDivinations",
				"label": "Major Divinations",
				"text": "Level-5 miracles include major Divinations, miracles that reveal things to one through the agency of their Estate. This includes shadowy images of the future or other places, and exact" +
						" images of other places (past or present) where the Estate <b>has been</b>. For example, a character with the sun as their Estate might ask the sun about the activities of thier enemies." +
						" They would receive a report on anything that it saw in its journey through the sky.",
				"examples": [
					"(Music) Tell the future in extemporaneous song.",
					"(Forests) Find the mystical \"heart\" of a forest; talk to plants.",
					"(Storms) Scry in a bowl of rainwater.",
					"(Night) Know all that happens under the cloak of night.",
					"(Emotion) Know the root of every emotion felt during a scene.",
					"(Roads) Know about any interesting travels or travelers.",
					"(Books) Open a book at random and read a paragraph -- whatever it is will be relevant."
				]
			},
			{
				"level": 6,
				"name": "lesserChanges",
				"label": "Lesser Changes",
				"text":	"Level-6 miracles include lesser Change magic, miracles that twist and remake things from one's Estate into a new form with new properties. For example, the Power of the Sun might make the" +
						" sun shine red, or craft edible fire.",
				"examples": [
					"(Music) Make living music that reproduces by being heard.",
					"(Forests) Reshape trees into treelike playground equiptment.",
					"(Storms) Make raindrops sing; make it hail blueberries.",
					"(Night) Make starlight as bright as moonlight for a night.",
					"(Emotion) Make someone feel brand-new emotions.",
					"(Roads) Redirect a road, so it leads somewhere new.",
					"(Books) Change the genre of the books that a given author writes."
				]
			},
			{
				"level": 6,
				"name": "majorPreservations",
				"label": "Major Preservations",
				"text": "Level-6 miracles include major Preservation miracles of epic scope. Preserved sunlight, at this level, would no longer simple heat the Earth; it would be burned into the stone. The day, in" +
						" a single city or a given Chancel, could be made to last for what would normally be years.",
				"examples": [
					"(Music) Burn music into someone's mind so they could never forget a note.",
					"(Forests) Seal a forest against entrance by any enemy.",
					"(Storms) Make an ongoing storm perpetual, raging.",
					"(Night) Make it stay dark even when night ends and the sun is up.",
					"(Emotion) Make someone happy for ever and ever.",
					"(Roads) Make the road someone is on endless.",
					"(Books) Make an author eternally famous. Why do you think we still read Hemingway?"
				]
			},
			{
				"level": 7,
				"name": "majorCreations",
				"label": "Major Creations",
				"text":	"Level-7 miracles are major magics of Creation. Even the most epic of Creations is possible at these levels. With  a level 7 miracles, a character whose Estate is the sun could cause the sun" +
						" to rise in the middle of the night, or put a new, second, sun in the sky.",
				"examples": [
					"(Music) Deafen mortals for miles with loud music.",
					"(Forests) Grow a forest from a single seed.",
					"(Storms) Create a hurricane, tornado, or monsoon.",
					"(Night) Cast darkness over the Earth.",
					"(Emotion) Add new emotions to the normal human emotional vocabulary.",
					"(Roads) Make a one-mile road from Australia to America.",
					"(Books) Create librarie, masterpieces, and books of secret lore."
				]
			},
			{
				"level": 8,
				"name": "majorDestructions",
				"label": "Major Destructions",
				"text": "Level-8 miracles are the major Destrutive magics. With these miracles, a Power could \"turn off\" the sun or turn a baren desert into a glorious green land simply be \"removing\" its desiccation.",
				"examples": [
					"(Music) Destroy a song forever - no one will ever be able to recreate it.",
					"(Forests) Shatter a forest.",
					"(Storms) Calm the sky above the entire ocean.",
					"(Night) Make night as bright as day until you say otherwise.",
					"(Emotion) Remove a person's capacity to feel emotion.",
					"(Roads) Make it impossible to get to or from a location by <i>any</i> road.",
					"(Books) Destroy a written language."
				]
			},
			{
				"level": 9,
				"name": "majorChanges",
				"label": "Major Changes",
				"text": "Level-9 miracles, Major Changes, can do anything else to a character's Estate that is not covered by lesser miracles. These miracles are rarely-seen, as it's often better to combine creation and" +
						" destruction to achieve a similar effect. For example, if one wished to transform a pine foest into a forest of birch, they could simultaneously destroy the pines with a Greater Destruction and " +
						" create the birch forest with a Greater Creation. However, this would kill all the trees -- a single Level 9 miracle could preserve the original trees but change their species.",
				"examples": [
					"(Music) Give a song the ability to make any mortal listener weep.",
					"(Forests) Fill a forest with blue gnomes. Because, why not, I guess?",
					"(Storms) Make it rain every third day in a given Chancel.",
					"(Night) Fill the night with rainbows.",
					"(Emotion) Fill a crowd of Christmas shoppers with a murderous rage.",
					"(Roads) Make the roads of a small country twist like serpents.",
					"(Books) Rewrite all books into Esperanto."
				]
			}
		],
		
		"attributeMargins": {
			"simple": 0,
			"normal": 1,
			"hard": 2,
			"deep": 4,
			"wordOfCommand": 8
		}
	};
	
	nobilisData.miracleDifficulties = {
		"simple": {"cost": 0, "name": "Simple", "description": "These miracles require no effort from you; just your miraculous action."},
		"normal": {"cost": 1, "name": "Normal", "description": "These miracles require a bit of effort: (C) (A)MP and your miraculous action."},
		"hard": {"cost": 2, "name": "Hard", "description": "These miracles require a fair bit of effort: (C) (A)MP and your miraculous action."},
		"deep": {"cost": 4, "name": "Deep", "description": "These miracles require a lot of effort: (C) (A)MP and your miraculous action."},
		"wordOfCommand": {"cost": 8, "name": "Word of Command", "description": "These are the rarest and most difficult of miracles. You may only cast them at the cost of (C) (A)MP, your miraculous action, and a grievous wound."},
	};
})(this)