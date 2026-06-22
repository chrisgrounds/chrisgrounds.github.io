{
  description = "Development environment for the chrisgrounds.github.io Hakyll site";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      # Match the toolchain used by the GitHub Actions workflow.
      ghc = "ghc967";

      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = f:
        nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.haskell.compiler.${ghc}
            pkgs.cabal-install
            # Native dependencies pulled in transitively by Hakyll.
            pkgs.pkg-config
            pkgs.zlib
          ];
        };
      });
    };
}
