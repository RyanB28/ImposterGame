"use client"

import { useState } from 'react'
import { EyeIcon, EyeOffIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import { Slider } from './components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"

const categories = [
  { value: "object", label: "Object" },
  { value: "person", label: "Famous Person" },
  { value: "videogame", label: "Video Game" },
  { value: "movie", label: "Movie" },
  { value: "animal", label: "Animal" },
  { value: "food", label: "Food" },
]

const secretWordsByCategory = {
  object: ["Telescope", "Umbrella", "Bicycle", "Lighthouse", "Volcano"],
  person: ["Albert Einstein", "Marilyn Monroe", "Nelson Mandela", "Leonardo da Vinci", "Marie Curie"],
  videogame: ["Minecraft", "The Legend of Zelda", "Fortnite", "Super Mario Bros", "Pac-Man"],
  movie: ["The Godfather", "Star Wars", "Pulp Fiction", "Titanic", "The Matrix"],
  animal: ["Elephant", "Penguin", "Giraffe", "Octopus", "Kangaroo"],
  food: ["Pizza", "Sushi", "Tacos", "Chocolate", "Spaghetti"],
}

export default function Component() {
  const [players, setPlayers] = useState<string[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [imposters, setImposters] = useState<string[]>([])
  const [revealedImposters, setRevealedImposters] = useState<string[]>([])
  const [imposterCount, setImposterCount] = useState(1)
  const [secretWord, setSecretWord] = useState<string | null>(null)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gamePhase, setGamePhase] = useState<'setup' | 'reveal' | 'discussion' | 'voting' | 'result'>('setup')
  const [currentVote, setCurrentVote] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(categories[0].value)

  const maxPlayers = 12

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < maxPlayers) {
      setPlayers([...players, newPlayerName.trim()])
      setNewPlayerName('')
    }
  }

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
    setImposterCount(prev => Math.min(prev, Math.floor((players.length - 1) / 2)))
  }

  const startGame = () => {
    if (players.length >= 3 && imposterCount < players.length - 1) {
      const shuffled = [...players].sort(() => 0.5 - Math.random())
      const newImposters = shuffled.slice(0, imposterCount)
      setImposters(newImposters)
      setRevealedImposters([])
      const categoryWords = secretWordsByCategory[selectedCategory as keyof typeof secretWordsByCategory]
      const newSecretWord = categoryWords[Math.floor(Math.random() * categoryWords.length)]
      setSecretWord(newSecretWord)
      setCurrentPlayerIndex(0)
      setGamePhase('reveal')
      setCurrentVote(null)
      setShowSecret(false)
    }
  }

  const nextPlayer = () => {
    setShowSecret(false)
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1)
    } else {
      setGamePhase('discussion')
    }
  }

  const startVoting = () => {
    setGamePhase('voting')
  }

  const votePlayer = (player: string) => {
    setCurrentVote(player)
    if (imposters.includes(player) && !revealedImposters.includes(player)) {
      setRevealedImposters([...revealedImposters, player])
    }
    
    if (revealedImposters.length + (imposters.includes(player) ? 1 : 0) === imposters.length) {
      setGamePhase('result')
    }
  }

  const nextVote = () => {
    setCurrentVote(null)
  }

  const maxImposters = Math.floor(players.length / 2)

  const renderGameContent = () => {
    switch (gamePhase) {
      case 'setup':
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              />
              <Button onClick={addPlayer} disabled={players.length >= maxPlayers}>
                <PlusIcon className="w-4 h-4 mr-2" /> Add Player
              </Button>
            </div>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{player}</span>
                  <Button variant="ghost" size="sm" onClick={() => removePlayer(index)}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Imposters: {imposterCount}</label>
              <Slider
                value={[imposterCount]}
                onValueChange={(value) => setImposterCount(value[0])}
                max={maxImposters}
                min={1}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Category:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={startGame} disabled={players.length < 3 || imposterCount >= players.length - 1} className="w-full">
              Start Game
            </Button>
            {players.length < 3 && (
              <p className="text-sm text-muted-foreground">Add at least 3 players to start the game.</p>
            )}
            {imposterCount >= players.length - 1 && (
              <p className="text-sm text-muted-foreground">Too many imposters. Reduce the number of imposters or add more players.</p>
            )}
          </div>
        )
      case 'reveal':
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold mb-2">{players[currentPlayerIndex]}</h3>
              <div className="flex items-center justify-between mb-4">
                <p>
                  {showSecret ? (
                    imposters.includes(players[currentPlayerIndex])
                      ? "You are an imposter!"
                      : `The secret word is: ${secretWord}`
                  ) : (
                    "Click the eye icon to reveal your role"
                  )}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOffIcon /> : <EyeIcon />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Category: {categories.find(c => c.value === selectedCategory)?.label}</p>
              <Button onClick={nextPlayer} className="w-full">
                {currentPlayerIndex < players.length - 1 ? "Next Player" : "Start Discussion"}
              </Button>
            </Card>
          </div>
        )
      case 'discussion':
        return (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold">Time to discuss! Try to figure out who the imposters are.</p>
            <p className="text-sm text-muted-foreground">Category: {categories.find(c => c.value === selectedCategory)?.label}</p>
            <Button onClick={startVoting}>Start Voting</Button>
          </div>
        )
      case 'voting':
        return (
          <div className="space-y-4">
            <p className="text-center text-lg font-semibold">Vote for who you think is an imposter:</p>
            <p className="text-center text-sm text-muted-foreground">Category: {categories.find(c => c.value === selectedCategory)?.label}</p>
            <div className="grid grid-cols-2 gap-4">
              {players.map(player => (
                <Button 
                  key={player}
                  onClick={() => votePlayer(player)} 
                  variant="outline"
                  className={`h-20 ${
                    revealedImposters.includes(player)
                      ? "bg-green-500 hover:bg-green-600"
                      : currentVote === player
                        ? imposters.includes(player)
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                        : ""
                  }`}
                  disabled={currentVote !== null || revealedImposters.includes(player)}
                >
                  Vote for {player}
                </Button>
              ))}
            </div>
            {currentVote && (
              <div className="text-center space-y-2">
                <p className={`font-bold ${imposters.includes(currentVote) ? "text-green-500" : "text-red-500"}`}>
                  {imposters.includes(currentVote) 
                    ? `Correct! ${currentVote} is an imposter!` 
                    : `Wrong! ${currentVote} is not an imposter.`}
                </p>
                <Button onClick={nextVote} className="w-full">
                  {revealedImposters.length === imposters.length ? "See Results" : "Next Vote"}
                </Button>
              </div>
            )}
          </div>
        )
      case 'result':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold">Game Over!</h2>
            <p>The imposters were: {imposters.join(', ')}</p>
            <p>The secret word was: {secretWord}</p>
            <p className="text-sm text-muted-foreground">Category: {categories.find(c => c.value === selectedCategory)?.label}</p>
            <Button onClick={() => setGamePhase('setup')}>New Game</Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Who are the Imposters?</CardTitle>
        </CardHeader>
        <CardContent>
          {renderGameContent()}
        </CardContent>
      </Card>
    </div>
  )
}