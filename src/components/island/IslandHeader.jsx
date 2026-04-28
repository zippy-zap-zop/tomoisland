import React from "react";
import { TreePalm } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IslandHeader() {
  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl mb-6 p-8 text-center space-y-4">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10">
        <TreePalm className="w-4 h-4 text-primary" />
        

        
      </div>
      <h1 className="text-[#048ac8] text-3xl font-black md:text-4xl">TOMOisland

      </h1>
      <p className="text-[#853700] mx-auto text-sm font-nunito max-w-lg">I've created an island generator to make your island look like it's more natural! it has similar generation to minecraft :). Hope you like it ❤️

      </p>
      <a href="https://ko-fi.com/zipzapzop" target="_blank" rel="noopener noreferrer">
        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-nunito font-bold">
          Donate!
        </Button>
      </a>
    </div>);

}